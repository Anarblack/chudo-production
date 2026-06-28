export const painScenes = [
  {
    id: 'value-gap',
    label: 'Ценность не считывается',
    signal: 'VALUE_GAP',
    question: 'Есть продукт — но клиент не понимает его ценность до встречи?',
    accent: '#ff4a0a',
  },
  {
    id: 'competitor-image',
    label: 'Конкуренты выглядят сильнее',
    signal: 'IMAGE_GAP',
    question: 'Конкуренты выглядят убедительнее, хотя ваш продукт лучше?',
    accent: '#8fb8ff',
  },
  {
    id: 'content-without-leads',
    label: 'Контент не продаёт',
    signal: 'TRUST_DROP',
    question: 'Контент выходит, но не приносит заявок и не усиливает доверие?',
    accent: '#79d7b6',
  },
  {
    id: 'idea-start',
    label: 'Нет точки входа',
    signal: 'BRIEF_EMPTY',
    question: 'Нужен ролик — но непонятно с какой идеи начать и сколько это стоит?',
    accent: '#f1efe8',
  },
  {
    id: 'shoot-chaos',
    label: 'Хаос на съёмке',
    signal: 'SHOOT_CHAOS',
    question: 'Съёмки прошли хаотично, результат не тот, деньги потрачены?',
    accent: '#d74b52',
  },
  {
    id: 'content-system',
    label: 'Нет системы материалов',
    signal: 'SYSTEM_NEEDED',
    question: 'Нужна не разовая съёмка, а видеосистема для сайта, соцсетей и продаж?',
    accent: '#a78bff',
  },
];

export const painMotionProfiles = [
  { x: 0, y: 64, rotate: 0, scale: 0.94, exitX: 0, exitY: -46, exitRotate: 0 },
  { x: -76, y: 0, rotate: -1.4, scale: 0.96, exitX: 70, exitY: 0, exitRotate: 1.4 },
  { x: 62, y: 30, rotate: 1, scale: 0.94, exitX: -42, exitY: -38, exitRotate: -1 },
  { x: 0, y: -38, rotate: 0.7, scale: 1.04, exitX: 0, exitY: 42, exitRotate: -0.7 },
  { x: -36, y: 54, rotate: -2, scale: 0.9, exitX: 30, exitY: -52, exitRotate: 2 },
  { x: 0, y: 24, rotate: 0, scale: 0.88, exitX: 0, exitY: -28, exitRotate: 0 },
];

export const painItemVariants = {
  hidden: (index) => {
    const profile = painMotionProfiles[index % painMotionProfiles.length];
    return {
      opacity: 0,
      x: profile.x,
      y: profile.y,
      rotate: profile.rotate,
      scale: profile.scale,
      filter: 'blur(20px)',
    };
  },
  visible: (index) => ({
    opacity: 1,
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: index === 5 ? 0.8 : 0.68,
      ease: [0.2, 0.8, 0.2, 1],
    },
  }),
  exit: (index) => {
    const profile = painMotionProfiles[index % painMotionProfiles.length];
    return {
      opacity: 0,
      x: profile.exitX,
      y: profile.exitY,
      rotate: profile.exitRotate,
      scale: index === 4 ? 0.88 : 1.03,
      filter: 'blur(17px)',
      transition: {
        duration: 0.38,
        ease: [0.5, 0, 0.2, 1],
      },
    };
  },
};
