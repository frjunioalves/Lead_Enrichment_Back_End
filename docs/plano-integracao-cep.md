# Plano de Implementação — Integração CEP (BrasilAPI)

## Objetivo

Enriquecer o endpoint `POST /api/leads/enrich` com dados de endereço detalhados (bairro,
logradouro, coordenadas geográficas e fuso horário) a partir do CEP retornado pela própria
consulta de CNPJ, usando o endpoint `GET https://brasilapi.com.br/api/cep/v2/{cep}`.

---

## Contexto atual

```
POST /api/leads/enrich
  └── enrichLeadSchema.parse(body)          ← valida nome, email, telefone, cnpj
  └── CNPJService.fetchByCNPJ(cnpj)         ← busca dados da Receita Federal
  └── transformCNPJData(raw)                ← mapeia para EnrichedCompany
  └── res.json({ nome, email, telefone, empresa })
```

O campo `raw.cep` já é retornado pela BrasilAPI de CNPJ, mas o endereço enriquecido
(`EnrichedCompany.endereco`) só usa `logradouro`, `municipio`, `uf` e `cep` em formato bruto.
A integração de CEP vai complementar esse objeto com dados mais ricos sem alterar a
interface pública do endpoint.

---

## Contrato da BrasilAPI — CEP v2

**Sucesso (200)**
```json
{
  "cep": "89010025",
  "state": "SC",
  "city": "Blumenau",
  "neighborhood": "Centro",
  "street": "Rua Doutor Luiz de Freitas Melro",
  "timezoneName": "America/Sao_Paulo",
  "location": {
    "type": "Point",
    "coordinates": {
      "longitude": "-49.0629788",
      "latitude": "-26.9244749"
    }
  }
}
```

**Erros mapeados**

| Status | name              | type             | Ação no serviço                     |
|--------|-------------------|------------------|-------------------------------------|
| 400    | BadRequestError   | validation_error | AppError 400 — CEP inválido         |
| 404    | NotFoundError     | service_error    | AppError 404 — CEP não encontrado   |
| 500    | InternalError     | internal_error   | AppError 502 — falha na BrasilAPI   |
| timeout/rede | —          | —                | AppError 504 — timeout              |

> **Estratégia de degradação**: a busca de CEP é best-effort. Se falhar por qualquer motivo,
> o endpoint retorna o lead enriquecido normalmente, com `endereco.complementoCep: null`.
> Isso evita que uma instabilidade no serviço de CEP derrube o fluxo principal.

---

## Arquivos a criar

### 1. `src/types/brasilapi.types.ts` — adicionar `BrasilApiCEPResponse`

```ts
export interface BrasilApiCEPResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string | null;
  street: string | null;
  timezoneName: string | null;
  location: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  } | null;
}
```

Adicionar ao final do arquivo existente — sem alterar os tipos de CNPJ.

---

### 2. `src/services/cep.service.ts` — novo serviço (espelha CNPJService)

```ts
import axios, { AxiosError } from 'axios';
import type { BrasilApiCEPResponse } from '../types/brasilapi.types.js';
import { AppError } from '../errors/AppError.js';

const BASE_URL = process.env['BRASILAPI_URL'] ?? 'https://brasilapi.com.br/api/';
const TIMEOUT_MS = Number(process.env['BRASILAPI_TIMEOUT_MS'] ?? 5000);

export class CEPService {
  static async fetchByCEP(cep: string): Promise<BrasilApiCEPResponse> {
    try {
      const { data } = await axios.get<BrasilApiCEPResponse>(`${BASE_URL}cep/v2/${cep}`, {
        timeout: TIMEOUT_MS,
      });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const { status } = error.response;
        if (status === 400) throw new AppError(400, 'CEP deve conter exatamente 8 dígitos.');
        if (status === 404) throw new AppError(404, 'CEP não encontrado.');
        throw new AppError(502, 'Erro ao consultar o serviço de CEP. Tente novamente mais tarde.');
      }
      throw new AppError(504, 'Timeout ao consultar o serviço de CEP.');
    }
  }
}
```

Reutiliza `BASE_URL` e `TIMEOUT_MS` já existentes nas env vars do projeto.

---

## Arquivos a modificar

### 3. `src/types/enriched.types.ts` — ampliar `EnrichedCompany.endereco`

```ts
// Antes
endereco: {
  logradouro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
};

// Depois
endereco: {
  logradouro: string | null;
  bairro: string | null;       // vem do CEP
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  coordenadas: {               // vem do CEP
    latitude: string;
    longitude: string;
  } | null;
  fuso: string | null;         // vem do CEP (timezoneName)
};
```

---

### 4. `src/utils/transformCNPJData.ts` — aceitar dados de CEP opcionais

Alterar a assinatura da função exportada:

```ts
// Antes
export function transformCNPJData(raw: BrasilApiCNPJResponse): EnrichedCompany

// Depois
export function transformCNPJData(
  raw: BrasilApiCNPJResponse,
  cep?: BrasilApiCEPResponse
): EnrichedCompany
```

No bloco `endereco`, mesclar os campos de CEP quando disponíveis:

```ts
endereco: {
  logradouro: cep?.street ?? raw.logradouro ?? null,
  bairro:     cep?.neighborhood ?? raw.bairro ?? null,
  municipio:  cep?.city ?? raw.municipio ?? null,
  uf:         cep?.state ?? raw.uf ?? null,
  cep:        raw.cep ? formatCEP(raw.cep) : null,
  coordenadas: cep?.location?.coordinates
    ? { latitude: cep.location.coordinates.latitude, longitude: cep.location.coordinates.longitude }
    : null,
  fuso: cep?.timezoneName ?? null,
},
```

Adicionar helper local `formatCEP`:

```ts
function formatCEP(cep: string): string {
  const d = cep.replace(/\D/g, '').padStart(8, '0');
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}
```

---

### 5. `src/controllers/lead.controller.ts` — orquestrar a busca de CEP

```ts
import { CEPService } from '../services/cep.service.js';
import type { BrasilApiCEPResponse } from '../types/brasilapi.types.js';

export async function enrichLead(req, res, next) {
  try {
    const { nome, email, telefone, cnpj: rawCnpj } = enrichLeadSchema.parse(req.body);

    const cnpj = sanitizeCNPJ(rawCnpj);
    const rawData = await CNPJService.fetchByCNPJ(cnpj);

    // Busca de CEP é best-effort: falha silenciosa não interrompe o fluxo
    let cepData: BrasilApiCEPResponse | undefined;
    if (rawData.cep) {
      const cleanCep = rawData.cep.replace(/\D/g, '');
      cepData = await CEPService.fetchByCEP(cleanCep).catch(() => undefined);
    }

    const empresa = transformCNPJData(rawData, cepData);
    res.status(200).json({ nome, email, telefone, empresa });
  } catch (error) {
    next(error);
  }
}
```

---

## Ordem de execução

```
1. src/types/brasilapi.types.ts      → adicionar BrasilApiCEPResponse
2. src/types/enriched.types.ts       → ampliar EnrichedCompany.endereco
3. src/services/cep.service.ts       → criar CEPService
4. src/utils/transformCNPJData.ts    → aceitar BrasilApiCEPResponse opcional
5. src/controllers/lead.controller.ts → orquestrar CEPService.fetchByCEP
```

Cada passo compila de forma incremental — erros de tipo do TypeScript guiam a propagação
das mudanças entre os módulos.

---

## Visualização de mapa (front-end)

As coordenadas retornadas em `empresa.endereco.coordenadas` são suficientes para renderizar
um mapa no cliente. O back-end não precisa de nenhuma alteração além de garantir que
`latitude` e `longitude` cheguem como `number` (a BrasilAPI retorna strings — ajustar no
`transformCNPJData.ts`).

### Ajuste no back-end — `transformCNPJData.ts`

```ts
// Converter strings para number ao montar coordenadas
coordenadas: cep?.location?.coordinates
  ? {
      latitude:  parseFloat(cep.location.coordinates.latitude),
      longitude: parseFloat(cep.location.coordinates.longitude),
    }
  : null,
```

E atualizar o tipo em `enriched.types.ts`:

```ts
coordenadas: {
  latitude: number;
  longitude: number;
} | null;
```

### Biblioteca escolhida: Leaflet + OpenStreetMap

Gratuito, sem chave de API e sem billing. Funciona diretamente com as coordenadas
retornadas pelo back-end.

**Instalação (front-end)**

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

**Componente React**

```tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige o ícone padrão do Leaflet que some no build com Webpack/Vite
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Marker.prototype.options.icon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow });

function EmpresaMap({ coordenadas, nome }: {
  coordenadas: { latitude: number; longitude: number };
  nome: string;
}) {
  const position: [number, number] = [coordenadas.latitude, coordenadas.longitude];

  return (
    <MapContainer center={position} zoom={15} style={{ height: 300, width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>{nome}</Popup>
      </Marker>
    </MapContainer>
  );
}

export default EmpresaMap;
```

**Uso no componente de resultado**

```tsx
{empresa.endereco.coordenadas && (
  <EmpresaMap
    coordenadas={empresa.endereco.coordenadas}
    nome={empresa.nomeFantasia ?? empresa.razaoSocial}
  />
)}
```

> O componente só renderiza quando `coordenadas` não é `null` — protege contra empresas
> cujo CEP não foi encontrado na BrasilAPI.

---

## Exemplo de resposta final

```json
{
  "nome": "Maria Silva",
  "email": "maria@empresa.com",
  "telefone": "(47) 99999-0000",
  "empresa": {
    "cnpj": "12.345.678/0001-99",
    "razaoSocial": "Empresa Exemplo Ltda",
    "nomeFantasia": "Exemplo",
    "situacaoCadastral": "Ativa",
    "dataAbertura": "15/03/2010",
    "cnae": { "codigo": 6201500, "descricao": "Desenvolvimento de programas de computador sob encomenda" },
    "segmento": "Tecnologia e Comunicação",
    "faixaFuncionarios": "Microempresa (até 9 funcionários)",
    "endereco": {
      "logradouro": "Rua Doutor Luiz de Freitas Melro",
      "bairro": "Centro",
      "municipio": "Blumenau",
      "uf": "SC",
      "cep": "89010-025",
      "coordenadas": {
        "latitude": "-26.9244749",
        "longitude": "-49.0629788"
      },
      "fuso": "America/Sao_Paulo"
    },
    "telefone": "(47) 99999-0000",
    "email": "contato@empresa.com"
  }
}
```
