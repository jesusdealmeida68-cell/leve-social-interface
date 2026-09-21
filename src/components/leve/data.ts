import editorialOne from "@/assets/leve-editorial-1.jpg";
import editorialTwo from "@/assets/leve-editorial-2.jpg";
import editorialThree from "@/assets/leve-editorial-3.jpg";
import videoEstudio from "@/assets/leve-video-estudio.mp4";
import videoAtlantico from "@/assets/leve-video-atlantico.mp4";

export type Section = "feed" | "messages" | "profile";

export type Person = {
  name: string;
  handle: string;
  image?: string;
  bio?: string;
  followers?: number;
  following?: number;
};

export type Post = {
  id: number;
  author: Person;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  views: number;
  time: string;
  /** Vídeo da publicação (quando existe, o feed mostra o leitor em vez da imagem). */
  video?: string;
  duration?: string;
  /** Quando a publicação junta várias fotos/vídeos, o total de itens (a miniatura mostra este número). */
  mediaCount?: number;
};

export type ChatMessage = { from: "me" | "them"; text: string };

export type Conversation = {
  person: Person;
  time: string;
  unread: number;
  thread: ChatMessage[];
};

/* ------------------------------ Pessoas ------------------------------ */

export const amara: Person = {
  name: "Amara Costa",
  handle: "@amaracosta",
  image: editorialOne,
  bio: "Direção criativa, imagem e ideias em movimento. Luanda, Angola.",
  followers: 18400,
  following: 482,
};
export const joel: Person = {
  name: "Joel Mota",
  handle: "@joelmota",
  image: editorialTwo,
  bio: "Artista visual. Processos, esboços e o estúdio por dentro.",
  followers: 9200,
  following: 316,
};
export const lina: Person = {
  name: "Lina Sousa",
  handle: "@linasousa",
  image: editorialThree,
  bio: "Fotografia de rua e o Atlântico ao fim do dia. Luanda, Angola.",
  followers: 24700,
  following: 198,
};
export const equipa: Person = {
  name: "Equipa LEVE",
  handle: "@equipaleve",
  bio: "Novidades, dicas e avisos oficiais do LEVE.",
  followers: 51200,
  following: 4,
};

/** A pessoa que está a usar o protótipo. */
export const me = amara;

/** Todas as pessoas conhecidas do protótipo, para encontrar uma pelo @. */
export const people: Person[] = [amara, joel, lina, equipa];

export function personByHandle(handle: string): Person | undefined {
  return people.find((person) => person.handle === handle);
}

/** Caminho do perfil de uma pessoa: a própria vai para /perfil, as outras para /perfil/@handle. */
export function profilePath(person: Person): string {
  return person.handle === me.handle ? "/perfil" : `/perfil/${person.handle.slice(1)}`;
}

export const suggestions: Person[] = [joel, lina];

/* ------------------------------ Publicações ------------------------------ */

export const posts: Post[] = [
  {
    id: 1,
    author: amara,
    image: editorialOne,
    caption: "Entre linhas, luz e silêncio. Uma tarde a criar sem pressa.",
    likes: 2480,
    comments: 128,
    views: 18400,
    time: "Há 18 min",
    mediaCount: 4,
  },
  {
    id: 2,
    author: joel,
    image: editorialTwo,
    caption: "O processo também merece ser visto. Novas ideias a ganhar forma no estúdio.",
    likes: 1870,
    comments: 94,
    views: 12900,
    time: "Há 2 h",
    duration: "0:11",
    video: videoEstudio,
  },
  {
    id: 3,
    author: lina,
    image: editorialThree,
    caption: "Luanda desacelera quando o Atlântico encontra o fim do dia.",
    likes: 4210,
    comments: 207,
    views: 56800,
    time: "Ontem",
    duration: "0:08",
    video: videoAtlantico,
  },
];

/** Publicações do perfil: 12 blocos para fechar linhas de 3 e de 4 colunas. */
export const profilePosts: Post[] = [...posts, ...posts, ...posts, ...posts].map((post, index) => ({
  ...post,
  id: 100 + index,
  author: amara,
}));

/** Todas as publicações conhecidas, para procurar uma pelo id (ex.: página de assistir vídeo). */
export const allPosts: Post[] = [...posts, ...profilePosts];

export function getPostById(id: number): Post | undefined {
  return allPosts.find((post) => post.id === id);
}

/** Publicações de uma pessoa (pelo @), para a página de perfil de quem não é "eu". */
export function postsByAuthor(handle: string): Post[] {
  return posts.filter((post) => post.author.handle === handle);
}

/** Vídeos disponíveis, na ordem em que aparecem no feed e no perfil. */
export const videoPosts: Post[] = allPosts.filter((post): post is Post & { video: string } =>
  Boolean(post.video),
);

export const profileCover = editorialThree;

export const postComments: { person: Person; text: string }[] = [
  { person: joel, text: "A luz ficou incrível." },
  { person: lina, text: "Que série bonita!" },
];

/* ------------------------------ Mensagens ------------------------------ */

export const conversations: Conversation[] = [
  {
    person: joel,
    time: "18:16",
    unread: 2,
    thread: [
      { from: "them", text: "Amara, viste os esboços que enviei?" },
      { from: "me", text: "Vi agora. A direção da luz está ótima." },
      { from: "them", text: "Ficas com a versão do estúdio?" },
      { from: "me", text: "Sim, vamos publicar amanhã de manhã." },
      { from: "them", text: "Enviei os esboços novos." },
    ],
  },
  {
    person: lina,
    time: "Ontem",
    unread: 0,
    thread: [
      { from: "me", text: "A foto do Atlântico está lindíssima." },
      { from: "them", text: "Obrigada! Foi mesmo ao fim do dia." },
      { from: "them", text: "Até amanhã ✦" },
    ],
  },
  {
    person: equipa,
    time: "Seg",
    unread: 0,
    thread: [
      {
        from: "them",
        text: "Bem-vinda ao LEVE. Partilha a tua primeira publicação quando quiseres.",
      },
    ],
  },
];

export const defaultConversation: Conversation = conversations[0] ?? {
  person: joel,
  time: "",
  unread: 0,
  thread: [],
};

/* ------------------------------ Extras ------------------------------ */

export const notifications: { person: Person; text: string; time: string }[] = [
  { person: joel, text: "começou a seguir-te.", time: "5 min" },
  { person: lina, text: "gostou da tua publicação.", time: "32 min" },
];

export const trending: { tag: string; detail: string }[] = [
  { tag: "Criadores de Angola", detail: "2,8 mil publicações hoje" },
  { tag: "Luanda ao fim do dia", detail: "1,4 mil publicações" },
  { tag: "Bastidores do estúdio", detail: "912 publicações" },
];
