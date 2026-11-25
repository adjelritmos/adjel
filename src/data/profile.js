// Dados tirados do "currículo v3.pdf". Edite aqui para atualizar o portfólio.
export const profile = {
  name: 'Adjel Soares',
  firstName: 'Adjel',
  role: 'Desenvolvedor Full Stack',
  education: 'Informática de Gestão · Mestrado em Electrotecnia e Computação',
  location: 'Bragança, Portugal',
  email: 'adjelrita725@gmail.com',
  linkedin: 'https://www.linkedin.com/in/adjelritmo-java',
  linkedinLabel: 'linkedin.com/in/adjelritmo-java',
  summary:
    'Licenciado em Informática de Gestão, com sólida formação em sistemas de informação, programação e análise de dados. Desenvolvo aplicações móveis, web e desktop, com experiência full stack — das interfaces de utilizador às bases de dados e APIs. Adapto-me facilmente a diferentes tecnologias e frameworks para entregar soluções completas e funcionais.',
  languages: [
    { name: 'Português', level: 'Nativo' },
    { name: 'Inglês', level: 'Básico' },
  ],
  soft: ['Gestão de Tempo', 'Organização', 'Proatividade'],

  skills: [
    {
      group: 'Linguagens',
      items: [
        { name: 'JavaScript', desc: 'Soluções interativas para web e mobile, com foco em performance e manipulação eficiente de DOM/APIs.' },
        { name: 'TypeScript', desc: 'Tipagem estática para robustez, rastreabilidade e manutenção em projetos de médio e grande porte.' },
        { name: 'Java', desc: 'Sistemas orientados a objetos, backends escaláveis, segurança e integração com bases de dados.' },
        { name: 'Python', desc: 'Scripts, automações e backends — atualmente no backend do portal ChemPixels.' },
      ],
    },
    {
      group: 'Frameworks',
      items: [
        { name: 'ReactJS', desc: 'Interfaces reativas e componentizadas, gestão de estado e otimização de renderização.' },
        { name: 'React Native', desc: 'Apps nativas para iOS e Android partilhando lógica com o ecossistema React.' },
        { name: 'Node.js', desc: 'Criação de APIs com o ecossistema npm e arquiteturas event-driven.' },
      ],
    },
    {
      group: 'Áreas',
      items: [
        { name: 'Backend', desc: 'Modelação de negócio, APIs RESTful, autenticação/autorização e otimização de consultas.' },
        { name: 'Frontend', desc: 'Interfaces responsivas e acessíveis, consumo de APIs e boa experiência do utilizador.' },
        { name: 'Fullstack', desc: 'Integração entre frontend e backend com consistência e performance.' },
      ],
    },
  ],

  experience: [
    {
      title: 'Bolsa de Iniciação à Investigação',
      org: 'CeDRI · UPB',
      period: 'Mar – Ago 2026',
      points: ['Desenvolvimento FullStack da Plataforma EDI⁺ Tools (edi.ipb.pt/edi)'],
    },
    {
      title: 'Estágio voluntário',
      org: 'CeDRI · UPB',
      period: 'Jan 2026',
      points: ['Desenvolvimento frontend do portal web ChemPixels'],
    },
    {
      title: 'Estágio curricular',
      org: 'Megatic',
      period: 'Jul – Ago 2023',
      points: ['Desenvolvimento de aplicação mobile', 'FlutterFlow'],
    },
  ],

  education_list: [
    { title: 'Mestrado em Electrotecnia e Computação', org: 'Universidade Politécnica de Bragança', period: 'Atual' },
    { title: 'Licenciatura em Informática de Gestão', org: 'Universidade Politécnica de Bragança', period: '2022 – 2025 · Média 15' },
    { title: 'Certificado de Mérito', org: 'Melhor aluno do curso · Média 15 valores', period: '2022 – 2025' },
  ],

  projects: [
    { name: 'Plataforma EDI⁺ Tools', tag: 'CeDRI · 2026', desc: 'Plataforma full stack desenvolvida no CeDRI.', url: 'https://edi.ipb.pt' },
    { name: 'Portal web ChemPixels', tag: 'CeDRI · em desenvolvimento', desc: 'Portal web com frontend em React e backend em Python.', url: 'https://chempixel.cedri.ipb.pt' },
    { name: 'Elegantie Invities', tag: 'Pessoal · em desenvolvimento', desc: 'Projeto pessoal full stack.' },
    { name: 'Academia de Treinamento Evangelístico', tag: 'Projeto final de licenciatura', desc: 'Plataforma educacional (mobile + desktop) com módulos progressivos, backend com gestão de utilizadores, conteúdos e comandos de voz.' },
    { name: 'AssemblyGram', tag: 'ESTiG/IPB · 2026', desc: 'Conversação natural com reconhecimento (speech-to-text) e síntese de voz (text-to-speech).' },
    { name: 'Levando a Mensagem da Cruz', tag: 'Web · 2026', desc: 'Site cristão de devocionais, estudos bíblicos e atividades.', url: 'https://lmcruz.onrender.com' },
    { name: 'Bíblia LMCruz', tag: 'Mobile · 2025', desc: 'Bíblia digital: partilhar e ouvir versículos, pesquisa, planos de leitura e devocionais.' },
    { name: 'Lungwá Nón', tag: 'React Native · 2025', desc: 'Dicionário do Crioulo Forro com pesquisa, favoritos e pronúncia.' },
    { name: 'CasaFlow', tag: 'Desktop · 2025', desc: 'Distribuição de despesas em casas partilhadas.' },
    { name: 'Escala dos Irmãos', tag: 'Desktop · 2025', desc: 'Gestão de membros e geração/exportação de escalas de cultos.' },
    { name: 'Patxi Sangui', tag: 'Conceito · 2026', desc: 'Liga doadores de sangue voluntários a hospitais em São Tomé e Príncipe.' },
  ],
}
