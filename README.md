<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Solo in Public - Agente como Serviço (AaaS)

## Descrição
Solo in Public é uma plataforma que ajuda fundadores solo a construir e crescer em público no LinkedIn, utilizando inteligência artificial para otimizar a criação de conteúdo.

## Agente Pro-Founder

O **Agente Pro-Founder** é o assistente de IA da plataforma que trabalha em conjunto com fundadores solo para otimizar a criação e publicação de conteúdo no LinkedIn.

### Filosofia e Regras de Negócio

**Regra Fundamental:**
> **Nós nunca publicaremos nada sem a sua permissão.**

Esta é a regra de ouro do Agente Pro-Founder. Todas as publicações, sugestões de conteúdo e ações no LinkedIn serão sempre submetidas à sua aprovação explícita antes de qualquer publicação. O agente trabalha como um copiloto inteligente que:

- Sugere conteúdo baseado em suas preferências e estratégia
- Propõe timing ideal para publicações
- Analisa engajamento e métricas
- **Sempre aguarda sua aprovação antes de publicar**

O controle total permanece com você, garantindo autenticidade e alinhamento com sua voz e valores.

## Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

## Configuração do Ambiente

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/solo-in-public.git
cd solo-in-public
```

2. Copie o arquivo de exemplo de variáveis de ambiente
```bash
cp .env.example .env
```

3. Configure suas variáveis de ambiente
- Abra o arquivo `.env`
- Adicione sua chave de API do Google GenAI em `VITE_GOOGLE_GENAI_API_KEY`

## Instalação de Dependências
```bash
npm install
# ou
yarn install
```

## Executando o Projeto
```bash
# Modo de desenvolvimento
npm run dev
# ou
yarn dev

# Build para produção
npm run build
# ou
yarn build

# Preview da build de produção
npm run preview
# ou
yarn preview
```

## Estrutura do Projeto
- `src/`: Código-fonte principal
- `components/`: Componentes React
- `hooks/`: Hooks personalizados
- `locales/`: Arquivos de internacionalização
- `types.ts`: Definições de tipos TypeScript

## Tecnologias Principais
- React
- TypeScript
- Vite
- Tailwind CSS
- Google GenAI

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça um push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
[Inserir informações de licença]

## Contato
[Inserir informações de contato]
