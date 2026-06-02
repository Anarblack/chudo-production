import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import logo from '../assets/chudo-logo-transparent.png';
import cameraModelUrl from '../assets/red_camera_web.glb?url';
import CustomCursor from './components/CustomCursor.jsx';
import BlurText from './components/BlurText.jsx';

const navItems = [
  { label: 'Боли рынка', href: '#market-pains' },
  { label: 'Что предлагаем', href: '#offer' },
  { label: 'УТП', href: '#usp' },
  { label: 'Кейсы', href: '#cases' },
  { label: 'Формат работы', href: '#workflow' },
  { label: 'Связаться', href: '#contact' },
];

const cameraTags = ['rotate 360°', 'zoom ready', 'client frame'];

const painQuestions = [
  'Нужен ролик, но непонятно, с какой идеи начать?',
  'Есть продукт, но сложно объяснить его ценность за 30 секунд?',
  'Контент выходит, но не усиливает продажи и доверие?',
  'Портфолио есть, но оно не выглядит достаточно убедительно?',
  'Съёмки проходят хаотично и без понятного результата?',
  'Нужен не один ролик, а система материалов для сайта, соцсетей и продаж?',
];

const painItemVariants = {
  hidden: {
    opacity: 0,
    y: 48,
    scale: 0.94,
    filter: 'blur(18px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.68,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -42,
    scale: 1.035,
    filter: 'blur(16px)',
    transition: {
      duration: 0.38,
      ease: [0.5, 0, 0.2, 1],
    },
  },
};

const services = [
  {
    title: 'Рекламные ролики',
    description: 'Видео для продвижения продукта, услуги, объекта или бренда в digital-среде.',
    tags: ['Attention', 'Product', 'Campaign'],
    visualTheme: {
      accent: '#f05a28',
      glow: 'rgba(240, 90, 40, 0.28)',
    },
  },
  {
    title: 'Имиджевые видео',
    description: 'Ролики, которые формируют образ компании, усиливают доверие и визуально раскрывают бренд.',
    tags: ['Brand', 'Trust', 'Image'],
    visualTheme: {
      accent: '#d8dde7',
      glow: 'rgba(216, 221, 231, 0.22)',
    },
  },
  {
    title: 'Контент для соцсетей',
    description: 'Reels, Shorts, TikTok и короткие форматы для регулярного присутствия бренда в ленте.',
    tags: ['Reels', 'Shorts', 'TikTok', 'Stories'],
    visualTheme: {
      accent: '#8fb8ff',
      glow: 'rgba(143, 184, 255, 0.24)',
    },
  },
  {
    title: 'Презентационные видео',
    description: 'Видео для сайта, встреч, выставок, партнёров, инвесторов и коммерческих предложений.',
    tags: ['Presentation', 'Partners', 'Pitch'],
    visualTheme: {
      accent: '#c9b37e',
      glow: 'rgba(201, 179, 126, 0.22)',
    },
  },
  {
    title: 'Видео для отдела продаж',
    description: 'Материалы, которые менеджеры могут отправлять клиентам после звонка, заявки или встречи.',
    tags: ['Sales', 'CRM', 'WhatsApp', 'Presentation'],
    visualTheme: {
      accent: '#79d7b6',
      glow: 'rgba(121, 215, 182, 0.2)',
    },
  },
  {
    title: 'Видеообзоры продуктов и объектов',
    description: 'Показываем автомобили, недвижимость, пространства, товары и услуги через понятную визуальную подачу.',
    tags: ['Review', 'Object', 'Details'],
    visualTheme: {
      accent: '#b9c6d9',
      glow: 'rgba(185, 198, 217, 0.22)',
    },
  },
  {
    title: 'Event-видео',
    description: 'Aftermovie, highlights, backstage и промо-ролики для мероприятий, запусков и событий.',
    tags: ['Event', 'Highlights', 'Backstage'],
    visualTheme: {
      accent: '#d74b52',
      glow: 'rgba(215, 75, 82, 0.24)',
    },
  },
  {
    title: 'Интервью и экспертный контент',
    description: 'Видео с руководителями, специалистами и клиентами для усиления доверия и экспертности.',
    tags: ['Trust', 'Expert', 'People'],
    visualTheme: {
      accent: '#f1efe8',
      glow: 'rgba(241, 239, 232, 0.18)',
    },
  },
  {
    title: 'Контент-пакеты',
    description: 'Из одной съёмки собираем систему материалов: главный ролик, короткие версии, вертикальные видео и нарезки.',
    tags: ['Main film', 'Reels', 'Stories'],
    visualTheme: {
      accent: '#a78bff',
      glow: 'rgba(167, 139, 255, 0.22)',
    },
  },
  {
    title: 'Продакшен-сопровождение',
    description: 'Регулярное создание видеоматериалов для брендов, которым нужен постоянный визуальный партнёр.',
    tags: ['Retainer', 'System', 'Partner'],
    visualTheme: {
      accent: '#92a0ad',
      glow: 'rgba(146, 160, 173, 0.22)',
    },
  },
];

const portfolioItems = [
  {
    id: 'chevrolet-model',
    title: 'Chevrolet — модельный ролик',
    category: 'Авто',
    serviceType: 'Рекламные ролики',
    image: 'https://picsum.photos/seed/chudo-chevrolet/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Короткий рекламный ролик для продвижения модели.',
  },
  {
    id: 'kia-dealer',
    title: 'KIA — контент для дилера',
    category: 'Авто',
    serviceType: 'Контент для соцсетей',
    image: 'https://picsum.photos/seed/chudo-kia-reels/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Серия вертикальных роликов для digital-продвижения.',
  },
  {
    id: 'avangard-complex',
    title: 'Avangard — жилой комплекс',
    category: 'Строительство',
    serviceType: 'Презентационные видео',
    image: 'https://picsum.photos/seed/chudo-avangard/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Видео объекта для сайта, соцсетей и отдела продаж.',
  },
  {
    id: 'ngroup-object',
    title: 'Ngroup — объект недвижимости',
    category: 'Строительство',
    serviceType: 'Видео для отдела продаж',
    image: 'https://picsum.photos/seed/chudo-ngroup-sales/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Материал для презентации объекта клиентам.',
  },
  {
    id: 'event-aftermovie',
    title: 'Event — aftermovie',
    category: 'Event',
    serviceType: 'Event-видео',
    image: 'https://picsum.photos/seed/chudo-event/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Атмосферный ролик с мероприятия.',
  },
  {
    id: 'brand-image',
    title: 'Brand — имиджевый ролик',
    category: 'Бренд',
    serviceType: 'Имиджевые видео',
    image: 'https://picsum.photos/seed/chudo-brand/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Визуальная история бренда.',
  },
  {
    id: 'product-review',
    title: 'Product — видеообзор объекта',
    category: 'Обзор',
    serviceType: 'Видеообзоры продуктов и объектов',
    image: 'https://picsum.photos/seed/chudo-product-review/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Понятная демонстрация деталей, масштаба и преимуществ продукта.',
  },
  {
    id: 'expert-interview',
    title: 'Expert — интервью',
    category: 'Экспертность',
    serviceType: 'Интервью и экспертный контент',
    image: 'https://picsum.photos/seed/chudo-interview/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Контент с экспертом для доверия, объяснения и прогрева аудитории.',
  },
  {
    id: 'content-pack',
    title: 'Content Pack — серия материалов',
    category: 'Система контента',
    serviceType: 'Контент-пакеты',
    image: 'https://picsum.photos/seed/chudo-content-pack/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Главный ролик, короткие версии, вертикальные видео и обложки из одной съёмки.',
  },
  {
    id: 'production-retainer',
    title: 'Production — сопровождение',
    category: 'Продакшен',
    serviceType: 'Продакшен-сопровождение',
    image: 'https://picsum.photos/seed/chudo-production/1200/750',
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Регулярный цикл планирования, съёмок и выпуска материалов для бренда.',
  },
];

const comparisonItems = [
  {
    ordinary: 'Снять красиво',
    chudo: 'Понять задачу бизнеса',
    description: 'Разбираем, зачем компании видео: продажи, доверие, объяснение продукта, имидж или контент.',
    tags: ['Strategy', 'Business task'],
  },
  {
    ordinary: 'Сценарий по ходу',
    chudo: 'Идея и сценарий до производства',
    description: 'Формулируем главный смысл, структуру ролика, визуальный стиль и ключевые сообщения до съёмки.',
    tags: ['Idea', 'Script'],
  },
  {
    ordinary: 'Один ролик',
    chudo: 'Контент-система из одной съёмки',
    description: 'Из одного проекта можно получить главный ролик, короткие версии, Reels, Stories, видео для WhatsApp, сайта и презентаций.',
    tags: ['Content system', 'Reels', 'Stories'],
  },
  {
    ordinary: 'Видео просто публикуется',
    chudo: 'Адаптация под площадки',
    description: 'Готовим материалы под Instagram, TikTok, YouTube, сайт, рекламу, презентации и отдел продаж.',
    tags: ['Instagram', 'TikTok', 'YouTube'],
  },
  {
    ordinary: 'Материал остаётся в архиве',
    chudo: 'Видео работает в продажах',
    description: 'Создаём материалы, которые менеджеры могут отправлять клиентам после звонка, заявки или встречи.',
    tags: ['Sales', 'CRM', 'WhatsApp'],
  },
  {
    ordinary: 'Много хаоса и переделок',
    chudo: 'Полный цикл без лишней нагрузки',
    description: 'Берём на себя путь от брифа, идеи и сценария до съёмки, монтажа, звука, цвета и финальных версий.',
    tags: ['Full cycle', 'Production', 'Postproduction'],
  },
];

const caseFilters = ['Все', 'Авто', 'Строительство', 'Бренды', 'Event', 'Соцсети', 'Продажи'];

const cases = [
  {
    id: 1,
    title: 'Chevrolet',
    category: 'Авто',
    type: 'Рекламный ролик',
    task: 'Показать модель через динамику, детали и ощущение владения.',
    solution: 'Создали визуальный ролик с акцентом на движение, экстерьер, интерьер и эмоциональное восприятие автомобиля.',
    formats: ['Hero video', 'Short version', 'Social cuts'],
    tags: ['Авто', 'Реклама', 'Digital'],
    image: '/portfolio/chevrolet-01.svg',
    videoUrl: '#',
    featured: true,
  },
  {
    id: 2,
    title: 'KIA',
    category: 'Авто',
    type: 'Контент для дилера',
    task: 'Создать видеоконтент для продвижения автомобилей в digital и соцсетях.',
    solution: 'Собрали серию роликов с акцентом на внешний вид, салон, детали и сценарии использования автомобиля.',
    formats: ['Reels', 'Shorts', 'Model video'],
    tags: ['Авто', 'Соцсети', 'Контент'],
    image: '/portfolio/kia-01.svg',
    videoUrl: '#',
  },
  {
    id: 3,
    title: 'Avangard',
    category: 'Строительство',
    type: 'Видео жилого комплекса',
    task: 'Показать объект недвижимости, инфраструктуру и атмосферу будущей жизни.',
    solution: 'Создали презентационный видеоматериал, который можно использовать на сайте, в соцсетях и отделе продаж.',
    formats: ['Main video', 'Sales version', 'Social cuts'],
    tags: ['ЖК', 'Недвижимость', 'Продажи'],
    image: '/portfolio/avangard-01.svg',
    videoUrl: '#',
    featured: true,
  },
  {
    id: 4,
    title: 'Ngroup',
    category: 'Строительство',
    type: 'Презентационное видео объекта',
    task: 'Визуально упаковать строительный объект для клиентов и презентаций.',
    solution: 'Сделали видео с акцентом на архитектуру, пространство, детали объекта и коммерческую подачу.',
    formats: ['Presentation video', 'Short version', 'Sales material'],
    tags: ['Строительство', 'Презентация', 'Объект'],
    image: '/portfolio/ngroup-01.svg',
    videoUrl: '#',
  },
  {
    id: 5,
    title: 'Event / Aftermovie',
    category: 'Event',
    type: 'Aftermovie',
    task: 'Передать атмосферу события и создать материал для дальнейшего продвижения.',
    solution: 'Собрали динамичный ролик с ключевыми моментами, эмоциями гостей, деталями площадки и общим настроением события.',
    formats: ['Aftermovie', 'Highlights', 'Stories'],
    tags: ['Event', 'Atmosphere', 'Promo'],
    image: '/portfolio/event-01.svg',
    videoUrl: '#',
  },
  {
    id: 6,
    title: 'Brand Commercial',
    category: 'Бренды',
    type: 'Имиджевый ролик',
    task: 'Показать бренд через визуальную историю, атмосферу и ценность продукта.',
    solution: 'Создали ролик с фокусом на образ, детали, настроение и узнаваемость бренда.',
    formats: ['Brand film', 'Social cuts', 'Short version'],
    tags: ['Brand', 'Image', 'Commercial'],
    image: '/portfolio/brand-01.svg',
    videoUrl: '#',
  },
  {
    id: 7,
    title: 'Видео для отдела продаж',
    category: 'Продажи',
    type: 'Sales video',
    task: 'Создать материал, который менеджеры смогут отправлять клиентам после звонка или встречи.',
    solution: 'Упаковали ключевые преимущества продукта в короткое видео, понятное для клиента без длинных объяснений.',
    formats: ['WhatsApp video', 'Presentation cut', 'Short video'],
    tags: ['Sales', 'CRM', 'WhatsApp'],
    image: '/portfolio/production-01.svg',
    videoUrl: '#',
  },
  {
    id: 8,
    title: 'Social Content Pack',
    category: 'Соцсети',
    type: 'Контент-пакет',
    task: 'Получить серию коротких материалов для регулярного присутствия бренда в соцсетях.',
    solution: 'Из одной съёмки собрали набор вертикальных видео, коротких нарезок и материалов для stories.',
    formats: ['Reels', 'Shorts', 'Stories', 'Teasers'],
    tags: ['Reels', 'TikTok', 'Content'],
    image: '/portfolio/content-pack-01.svg',
    videoUrl: '#',
  },
];

const workflowSteps = [
  {
    id: 1,
    title: 'Заявка и задача',
    description: 'Вы рассказываете, что хотите продвинуть: продукт, объект, бренд, событие или услугу. Мы уточняем цель видео и площадки, где оно будет использоваться.',
    weDo: 'Помогаем сформулировать задачу, понять формат видео и определить, где материал будет использоваться.',
    clientDoes: 'Кратко описать проект, цель, сроки и показать примеры, которые нравятся.',
    tags: ['Product', 'Object', 'Brand', 'Event', 'Service'],
    visualType: 'request',
  },
  {
    id: 2,
    title: 'Бриф и разбор',
    description: 'Разбираем аудиторию, продукт, сильные стороны, ограничения, сроки и желаемый результат.',
    weDo: 'Задаём правильные вопросы, фиксируем вводные, определяем ключевые сообщения и точки применения видео.',
    clientDoes: 'Ответить на вопросы по продукту, аудитории, задачам и ограничениям.',
    tags: ['Goal', 'Audience', 'Platform', 'Message'],
    visualType: 'brief',
  },
  {
    id: 3,
    title: 'Идея и концепция',
    description: 'Предлагаем основную идею ролика: настроение, визуальный стиль, сценарный ход и ключевое сообщение.',
    weDo: 'Собираем концепцию, визуальные референсы, настроение, подачу и главный смысл видео.',
    clientDoes: 'Согласовать направление или дать комментарии, если нужно изменить подачу.',
    tags: ['Concept', 'Moodboard', 'Key message'],
    visualType: 'concept',
  },
  {
    id: 4,
    title: 'Сценарий и структура',
    description: 'Собираем структуру ролика: сцены, кадры, текст, переходы, хронометраж и нужные версии.',
    weDo: 'Продумываем логику ролика, последовательность сцен, визуальные акценты и финальный call to action.',
    clientDoes: 'Согласовать сценарную основу, ключевые формулировки и важные детали продукта.',
    tags: ['Script', 'Storyboard', 'Timing'],
    visualType: 'storyboard',
  },
  {
    id: 5,
    title: 'Подготовка к съёмке',
    description: 'Готовим локации, график, команду, технику, героев, реквизит и съёмочный план.',
    weDo: 'Организуем production-подготовку: съёмочный план, call sheet, команда, оборудование, тайминг и список кадров.',
    clientDoes: 'Подтвердить дату, локацию, доступы, героев в кадре и ответственного со стороны компании.',
    tags: ['Call sheet', 'Location', 'Crew', 'Equipment'],
    visualType: 'preproduction',
  },
  {
    id: 6,
    title: 'Съёмка',
    description: 'Проводим съёмочный день: режиссура, операторская работа, свет, звук, работа с героями и контроль нужных кадров.',
    weDo: 'Управляем съёмочным процессом, следим за кадрами, светом, звуком, таймингом и соответствием сценарию.',
    clientDoes: 'Обеспечить доступ к локации, присутствие ответственного и оперативное согласование деталей на площадке.',
    tags: ['Production', 'REC', 'Camera', 'Light'],
    visualType: 'shooting',
  },
  {
    id: 7,
    title: 'Постпродакшен и передача',
    description: 'Монтируем, работаем со звуком, цветом, графикой и адаптациями. Передаём готовые материалы под сайт, соцсети, рекламу, WhatsApp или презентации.',
    weDo: 'Собираем монтаж, цветокоррекцию, звук, титры, графику и версии под нужные площадки.',
    clientDoes: 'Дать правки в согласованные сроки и подтвердить финальные версии.',
    tags: ['Edit', 'Color', 'Sound', 'Export'],
    visualType: 'postproduction',
  },
];

function AnchorNav({ compact = false }) {
  return (
    <nav className={compact ? 'anchor-nav anchor-nav--compact' : 'anchor-nav'} aria-label="Навигация по предложению">
      {navItems.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function MarketPainsSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let frame = 0;

    const updateActiveQuestion = () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const nextStep = Math.min(Math.max(-rect.top / viewportHeight, 0), painQuestions.length);
      const nextIndex = Math.min(painQuestions.length - 1, Math.floor(nextStep + 0.08));

      setActiveIndex(nextIndex);
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveQuestion);
    };

    updateActiveQuestion();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="market-pains"
      className="pains-section"
      aria-label="Боли целевой аудитории"
      style={{
        '--pains-scroll-height': `${painQuestions.length * 100}svh`,
      }}
    >
      <div className="pains-sticky">
        <div className="pain-stage" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              className="pain-question"
              variants={painItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={activeIndex}
            >
              {painQuestions[activeIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener('change', update);

    return () => {
      media.removeEventListener('change', update);
    };
  }, []);

  return isMobile;
}

function getServiceMatches(serviceTitle) {
  const matches = portfolioItems.filter((item) => item.serviceType === serviceTitle);
  return matches.length ? matches : portfolioItems;
}

function getSphericalPoint(index, total) {
  if (total <= 1) {
    return { x: 0, y: 0, z: 1 };
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / (total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = index * goldenAngle;

  return {
    x: Math.cos(theta) * radius,
    y,
    z: Math.sin(theta) * radius,
  };
}

function rotatePoint(point, rotation) {
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);
  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);

  const x1 = point.x * cosY + point.z * sinY;
  const z1 = -point.x * sinY + point.z * cosY;
  const y2 = point.y * cosX - z1 * sinX;
  const z2 = point.y * sinX + z1 * cosX;

  return { x: x1, y: y2, z: z2 };
}

function getFrontPortfolioItem(rotation) {
  return portfolioItems.reduce(
    (front, item, index) => {
      const point = rotatePoint(getSphericalPoint(index, portfolioItems.length), rotation);

      if (point.z > front.z) {
        return { item, z: point.z };
      }

      return front;
    },
    { item: portfolioItems[0], z: -Infinity },
  ).item;
}

function PortfolioCard({ item, style, isActive, isDimmed, onSelect }) {
  return (
    <motion.button
      type="button"
      className={[
        'portfolio-card',
        isActive ? 'is-active' : '',
        isDimmed ? 'is-dimmed' : '',
      ].join(' ')}
      style={style}
      onClick={onSelect}
      aria-pressed={isActive}
      aria-label={`${item.title}. ${item.category}`}
      initial={false}
      animate={{ opacity: isDimmed ? 0.24 : Number(style['--card-opacity']) }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <img src={item.image} alt="" loading="lazy" draggable="false" />
      <span className="portfolio-card__shade" />
      <span className="portfolio-card__meta">
        <span>{item.category}</span>
        <strong>{item.title}</strong>
        <small>{item.serviceType}</small>
      </span>
    </motion.button>
  );
}

function PortfolioSphere({ activeService, activeItem, onSelectItem }) {
  const isMobile = useIsMobile();
  const stageRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, rotation: { x: -0.16, y: 0.34 } });
  const dragMoved = useRef(false);
  const lastInteraction = useRef(0);
  const [rotation, setRotation] = useState({ x: -0.16, y: 0.34 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const relatedItems = useMemo(() => getServiceMatches(activeService.title), [activeService.title]);
  const relatedIds = useMemo(() => new Set(relatedItems.map((item) => item.id)), [relatedItems]);
  const serviceHasMatches = relatedItems.length > 0;

  useEffect(() => {
    let frameId = 0;
    let previous = performance.now();

    const tick = (now) => {
      const delta = Math.min(48, now - previous);
      previous = now;

      if (!isHovering && !isDragging && now - lastInteraction.current > 3600) {
        setRotation((current) => ({
          x: current.x,
          y: current.y + delta * 0.00013,
        }));
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frameId);
  }, [isDragging, isHovering]);

  const cards = useMemo(() => {
    const width = isMobile ? 0 : 250;
    const height = isMobile ? 0 : 150;

    return portfolioItems.map((item, index) => {
      const point = rotatePoint(getSphericalPoint(index, portfolioItems.length), rotation);
      const depth = (point.z + 1) / 2;
      const isActive = item.id === activeItem.id;
      const matchesService = !serviceHasMatches || relatedIds.has(item.id);
      const screenX = isActive ? point.x * width * 0.16 : point.x * width;
      const screenY = isActive ? point.y * height * 0.14 : point.y * height;
      const scale = isActive ? 1.16 : 0.58 + depth * 0.34;
      const opacity = isActive ? 1 : 0.34 + depth * 0.56;
      const rotateY = isActive ? 0 : point.x * -24;
      const rotateX = isActive ? 0 : point.y * 14;

      return {
        item,
        isActive,
        isDimmed: serviceHasMatches && !matchesService,
        style: {
          '--card-x': `${screenX}px`,
          '--card-y': `${screenY}px`,
          '--card-z': `${Math.round(point.z * 120)}px`,
          '--card-scale': scale,
          '--card-opacity': opacity,
          '--card-rotate-x': `${rotateX}deg`,
          '--card-rotate-y': `${rotateY}deg`,
          zIndex: isActive ? 80 : Math.round(depth * 60),
        },
      };
    });
  }, [activeItem.id, isMobile, relatedIds, rotation, serviceHasMatches]);

  const markInteraction = () => {
    lastInteraction.current = performance.now();
  };

  const handlePointerDown = (event) => {
    if (isMobile) {
      return;
    }

    setIsDragging(true);
    dragMoved.current = false;
    markInteraction();
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      rotation,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging || isMobile) {
      return;
    }

    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;

    if (Math.abs(dx) + Math.abs(dy) > 5) {
      dragMoved.current = true;
    }

    const nextRotation = {
      x: Math.max(-0.72, Math.min(0.72, dragStart.current.rotation.x - dy * 0.006)),
      y: dragStart.current.rotation.y + dx * 0.008,
    };
    const frontItem = getFrontPortfolioItem(nextRotation);

    setRotation(nextRotation);

    if (frontItem.id !== activeItem.id) {
      onSelectItem(frontItem);
    }
  };

  const handlePointerUp = (event) => {
    if (!isDragging) {
      return;
    }

    setIsDragging(false);
    markInteraction();
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (isMobile) {
    return (
      <div className="portfolio-mobile">
        <div className="portfolio-mobile__rail" aria-label="Портфолио Chudo Prod">
          {relatedItems.map((item) => (
            <button
              type="button"
              className={item.id === activeItem.id ? 'portfolio-mobile-card is-active' : 'portfolio-mobile-card'}
              key={item.id}
              onClick={() => onSelectItem(item)}
            >
              <img src={item.image} alt="" loading="lazy" />
              <span>{item.category}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={isDragging ? 'portfolio-sphere is-dragging' : 'portfolio-sphere'}
      onPointerEnter={() => setIsHovering(true)}
      onPointerLeave={() => setIsHovering(false)}
    >
      <div className="portfolio-orbits" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div
        className="portfolio-sphere__stage"
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Интерактивная 3D-галерея портфолио Chudo Prod"
      >
        {cards.map(({ item, style, isActive, isDimmed }) => (
          <PortfolioCard
            item={item}
            style={style}
            isActive={isActive}
            isDimmed={isDimmed}
            key={item.id}
            onSelect={() => {
              if (dragMoved.current) {
                return;
              }

              markInteraction();
              onSelectItem(item);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ServicesList({
  activeService,
  selectedService,
  onServiceSelect,
  onServicePreview,
  onServicePreviewEnd,
}) {
  return (
    <div className="services-list" role="list">
      {services.map((service, index) => {
        const isActive = activeService.title === service.title;
        const isSelected = selectedService.title === service.title;

        return (
          <motion.button
            className={isActive ? 'service-item is-active' : 'service-item'}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onServiceSelect(service)}
            onFocus={() => onServicePreview(service)}
            onBlur={onServicePreviewEnd}
            onPointerEnter={() => onServicePreview(service)}
            onPointerLeave={onServicePreviewEnd}
            onMouseEnter={() => onServicePreview(service)}
            onMouseLeave={onServicePreviewEnd}
            initial={{ opacity: 0, x: 22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.42, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
            key={service.title}
          >
            <span className="service-item__number">{String(index + 1).padStart(2, '0')}</span>
            <span className="service-item__content">
              <span className="service-item__title">{service.title}</span>
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.span
                    className="service-item__description"
                    initial={{ opacity: 0, height: 0, y: -4 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -4 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  >
                    {service.description}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function OfferSection() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [hoveredService, setHoveredService] = useState(null);
  const [activeItemId, setActiveItemId] = useState(portfolioItems[0].id);
  const activeService = hoveredService ?? selectedService;
  const activeItem = portfolioItems.find((item) => item.id === activeItemId) ?? portfolioItems[0];

  useEffect(() => {
    const matches = getServiceMatches(activeService.title);

    if (!matches.some((item) => item.id === activeItemId)) {
      setActiveItemId(matches[0].id);
    }
  }, [activeItemId, activeService.title]);

  const selectPortfolioItem = (item) => {
    const linkedService = services.find((service) => service.title === item.serviceType);

    setActiveItemId(item.id);
    setHoveredService(null);

    if (linkedService) {
      setSelectedService(linkedService);
    }
  };

  return (
    <section
      id="offer"
      className="offer-section"
      aria-labelledby="offer-title"
      style={{
        '--service-accent': activeService.visualTheme.accent,
        '--service-glow': activeService.visualTheme.glow,
      }}
    >
      <motion.div
        className="offer-showreel"
        initial={{ opacity: 0, y: 28, filter: 'blur(18px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.34 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <PortfolioSphere
          activeService={activeService}
          activeItem={activeItem}
          onSelectItem={selectPortfolioItem}
        />
      </motion.div>

      <div className="offer-panel">
        <motion.div
          className="offer-heading"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.44 }}
          transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <p className="eyebrow">Что мы предлагаем</p>
          <h2 id="offer-title">Что мы предлагаем</h2>
          <p>
            Создаём видеоконтент под задачи бизнеса: от одного ролика до полноценной системы
            материалов для продаж, соцсетей и презентаций.
          </p>
        </motion.div>

        <ServicesList
          activeService={activeService}
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
          onServicePreview={setHoveredService}
          onServicePreviewEnd={() => setHoveredService(null)}
        />
      </div>
    </section>
  );
}

function ComparisonRow({ item, index, isActive, onActivate, onDeactivate }) {
  return (
    <motion.article
      className={isActive ? 'comparison-row is-active' : 'comparison-row'}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.42 }}
      onViewportEnter={() => onActivate(index)}
      onPointerEnter={() => onActivate(index)}
      onPointerLeave={onDeactivate}
      onFocus={() => onActivate(index)}
      onBlur={onDeactivate}
      onClick={() => onActivate(index)}
      tabIndex={0}
      aria-label={`${item.ordinary}. ${item.chudo}`}
    >
      <motion.div
        className="comparison-card comparison-card--ordinary"
        variants={{
          hidden: { opacity: 0, y: 22, scale: 0.985, filter: 'grayscale(1) blur(8px)' },
          visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'grayscale(0.85) blur(0px)',
            transition: { duration: 0.54, ease: [0.2, 0.8, 0.2, 1] },
          },
        }}
      >
        <span>Обычная съёмка</span>
        <strong>{item.ordinary}</strong>
      </motion.div>

      <motion.div
        className="comparison-transform"
        variants={{
          hidden: { opacity: 0, scaleX: 0.6 },
          visible: {
            opacity: 1,
            scaleX: 1,
            transition: { duration: 0.42, delay: 0.20, ease: 'easeOut' },
          },
        }}
        aria-hidden="true"
      >
        <i />
        <small>обычная съёмка → продуманный видеопродукт</small>
      </motion.div>

      <motion.div
        className="comparison-card comparison-card--chudo"
        variants={{
          hidden: { opacity: 0, y: 30, x: -12, scale: 0.975, filter: 'blur(12px)' },
          visible: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            filter: 'blur(0px)',
            transition: { duration: 0.64, delay: 0.30, ease: [0.2, 0.8, 0.2, 1] },
          },
        }}
      >
        <span>Подход Chudo Prod</span>
        <strong>{item.chudo}</strong>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              className="comparison-card__detail"
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
            >
              <p>{item.description}</p>
              <div className="comparison-tags">
                {item.tags.map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  );
}

function UniqueValueSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const progressScale = useTransform(scrollYProgress, [0.12, 0.88], [0, 1]);

  return (
    <section ref={sectionRef} id="usp" className="usp-section" aria-labelledby="usp-title">
      <div className="usp-grain" aria-hidden="true" />
      <motion.div className="usp-progress" aria-hidden="true">
        <motion.span style={{ scaleY: progressScale }} />
      </motion.div>

      <motion.header
        className="usp-heading"
        initial={{ opacity: 0, y: 28, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">УТП</p>
        <h2 id="usp-title">Не просто съёмка. Продакшен под задачу бизнеса</h2>
        <p>
          Мы не начинаем с вопроса «что снять?». Мы начинаем с вопроса: какую задачу должно решить
          видео после публикации?
        </p>
      </motion.header>

      <div className="comparison-board">
        {comparisonItems.map((item, index) => (
          <ComparisonRow
            item={item}
            index={index}
            isActive={activeIndex === index}
            onActivate={setActiveIndex}
            onDeactivate={() => {}}
            key={item.chudo}
          />
        ))}
      </div>

      <motion.footer
        className="usp-footer"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.45 }}
        transition={{ duration: 0.62, ease: 'easeOut' }}
      >
        <p>
          Мы снимаем не ради самого видео. Мы создаём материал, который бизнес может использовать в
          коммуникации, продажах и продвижении.
        </p>
        <a className="button button--primary" href="#contact">
          Обсудить проект
        </a>
      </motion.footer>
    </section>
  );
}

function CaseFilters({ activeFilter, onFilterChange }) {
  return (
    <motion.div
      className="case-filters"
      role="tablist"
      aria-label="Фильтры кейсов"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.52, delay: 0.12, ease: 'easeOut' }}
    >
      {caseFilters.map((filter) => {
        const isActive = activeFilter === filter;

        return (
          <button
            type="button"
            className={isActive ? 'case-filter is-active' : 'case-filter'}
            role="tab"
            aria-selected={isActive}
            key={filter}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        );
      })}
    </motion.div>
  );
}

function CaseCard({ item, index, onSelect }) {
  const sizeClass = [
    index === 0 ? 'case-card--hero' : '',
    index === 1 || index === 2 ? 'case-card--side' : '',
    index === 3 || index === 6 ? 'case-card--wide' : '',
    item.featured ? 'is-featured' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <motion.button
      layout
      type="button"
      className={`case-card ${sizeClass}`}
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 28, scale: 0.965, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 16, scale: 0.94, filter: 'blur(10px)' }}
      whileHover={{ y: -6 }}
      whileFocus={{ y: -6 }}
      transition={{ duration: 0.42, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      aria-label={`Смотреть кейс ${item.title}`}
    >
      <img src={item.image} alt="" loading="lazy" draggable="false" />
      <span className="case-card__wash" />
      <span className="case-card__play" aria-hidden="true" />
      <span className="case-card__content">
        <span className="case-card__meta">
          <span>{item.category}</span>
          <span>{item.type}</span>
        </span>
        <strong>{item.title}</strong>
        <span className="case-card__task">{item.task}</span>
        <span className="case-card__tags">
          {item.tags.slice(0, 3).map((tag) => (
            <em key={tag}>{tag}</em>
          ))}
        </span>
        <span className="case-card__cta">Смотреть кейс</span>
      </span>
    </motion.button>
  );
}

function CaseGrid({ items, onSelectCase }) {
  return (
    <motion.div className="case-grid" layout>
      <AnimatePresence>
        {items.map((item, index) => (
          <CaseCard item={item} index={index} onSelect={onSelectCase} key={item.id} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

function CaseModal({ item, onClose }) {
  const hasVideo = item.videoUrl && item.videoUrl !== '#';

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="case-modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.24, ease: 'easeOut' }}
      onClick={onClose}
    >
      <motion.article
        className="case-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-modal-title-${item.id}`}
        initial={{ opacity: 0, y: 34, scale: 0.96, filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(10px)' }}
        transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="case-modal__close" onClick={onClose} aria-label="Закрыть кейс">
          ×
        </button>

        <div className="case-modal__media">
          {hasVideo ? (
            <iframe src={item.videoUrl} title={item.title} allow="autoplay; fullscreen; picture-in-picture" />
          ) : (
            <>
              <img src={item.image} alt="" />
              <span>Видео будет добавлено позже.</span>
            </>
          )}
        </div>

        <div className="case-modal__body">
          <p className="case-modal__kicker">{item.category} · {item.type}</p>
          <h3 id={`case-modal-title-${item.id}`}>{item.title}</h3>

          <div className="case-modal__section">
            <span>Задача</span>
            <p>{item.task}</p>
          </div>

          <div className="case-modal__section">
            <span>Решение</span>
            <p>{item.solution}</p>
          </div>

          <div className="case-modal__section">
            <span>Форматы</span>
            <div className="case-modal__formats">
              {item.formats.map((format) => (
                <em key={format}>{format}</em>
              ))}
            </div>
          </div>

          <div className="case-modal__tags">
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <a className="button button--primary" href="#contact" onClick={onClose}>
            Обсудить похожий проект
          </a>
        </div>
      </motion.article>
    </motion.div>
  );
}

function CasesSection() {
  const [activeFilter, setActiveFilter] = useState('Все');
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedCase, setSelectedCase] = useState(null);

  const filteredCases = useMemo(() => {
    if (activeFilter === 'Все') {
      return cases;
    }

    return cases.filter((item) => item.category === activeFilter || item.tags.includes(activeFilter));
  }, [activeFilter]);

  const visibleCases = filteredCases.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCases.length;

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setVisibleCount(8);
  };

  return (
    <section id="cases" className="cases-section" aria-labelledby="cases-title">
      <div className="cases-grain" aria-hidden="true" />

      <motion.header
        className="cases-heading"
        initial={{ opacity: 0, y: 30, filter: 'blur(14px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.42 }}
        transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Кейсы</p>
        <h2 id="cases-title">Кейсы и направления, с которыми мы работали</h2>
        <p>
          Каждый проект — это не просто ролик, а задача: показать объект, продвинуть продукт,
          усилить доверие или создать контент для продаж.
        </p>
      </motion.header>

      <CaseFilters activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      <CaseGrid items={visibleCases} onSelectCase={setSelectedCase} />

      {hasMore && (
        <div className="cases-more">
          <button type="button" className="button button--ghost" onClick={() => setVisibleCount((count) => count + 4)}>
            Показать ещё
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedCase && <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      </AnimatePresence>
    </section>
  );
}

function WorkflowVisual({ step, compact = false }) {
  const baseClassName = compact ? 'workflow-visual workflow-visual--compact' : 'workflow-visual';

  const renderVisual = () => {
    switch (step.visualType) {
      case 'brief':
        return (
          <div className="workflow-brief">
            <div className="workflow-brief__header">
              <span>Brief session</span>
              <strong>48%</strong>
            </div>
            <div className="workflow-brief__cards">
              {step.tags.map((tag, index) => (
                <span key={tag} style={{ '--workflow-delay': `${index * 0.08}s` }}>
                  <i />
                  {tag}
                </span>
              ))}
            </div>
            <div className="workflow-meter">
              <span />
            </div>
          </div>
        );

      case 'concept':
        return (
          <div className="workflow-concept">
            <div className="workflow-moodboard">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="workflow-key-message">
              <small>Key message</small>
              <strong>Один смысл. Один визуальный вектор.</strong>
            </div>
          </div>
        );

      case 'storyboard':
        return (
          <div className="workflow-storyboard">
            {['Scene 01', 'Scene 02', 'Scene 03'].map((scene, index) => (
              <div className="workflow-scene" key={scene}>
                <span>{scene}</span>
                <i />
                <small>{index === 0 ? '15s' : index === 1 ? '30s' : '60s'}</small>
              </div>
            ))}
            <div className="workflow-storyline">
              <span />
              <span />
              <span />
            </div>
          </div>
        );

      case 'preproduction':
        return (
          <div className="workflow-preproduction">
            <div className="workflow-calendar">
              <span>Thu</span>
              <strong>24</strong>
              <small>shoot day</small>
            </div>
            <div className="workflow-call-sheet">
              <strong>Call sheet</strong>
              {['Location confirmed', 'Crew locked', 'Equipment ready'].map((item) => (
                <span key={item}>
                  <i />
                  {item}
                </span>
              ))}
            </div>
          </div>
        );

      case 'shooting':
        return (
          <div className="workflow-monitor">
            <div className="workflow-monitor__frame">
              <span className="workflow-rec"><i /> REC</span>
              <span className="workflow-timecode">00:01:24:08</span>
              <div className="workflow-safe-lines">
                <span />
                <span />
                <span />
              </div>
              <div className="workflow-shot-list">
                <span><i /> Hero shot</span>
                <span><i /> Detail shot</span>
                <span><i /> Sound check</span>
              </div>
            </div>
          </div>
        );

      case 'postproduction':
        return (
          <div className="workflow-post">
            <div className="workflow-timeline-ui">
              {['Video', 'Color', 'Sound'].map((track, index) => (
                <span key={track} style={{ '--track-width': `${82 - index * 14}%` }}>
                  <i>{track}</i>
                </span>
              ))}
            </div>
            <div className="workflow-export-grid">
              {['Main video', 'Reels', 'Stories', 'YouTube', 'WhatsApp', 'Presentation'].map((format) => (
                <em key={format}>{format}</em>
              ))}
            </div>
          </div>
        );

      case 'request':
      default:
        return (
          <div className="workflow-request">
            <div className="workflow-message">
              <small>Incoming message</small>
              <strong>Нужен ролик под запуск продукта</strong>
            </div>
            <div className="workflow-request-card">
              <span>Project request received</span>
              <div>
                {step.tags.map((tag) => (
                  <em key={tag}>{tag}</em>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      className={`${baseClassName} workflow-visual--${step.visualType}`}
      key={compact ? `${step.id}-compact` : step.id}
      initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, scale: 0.98, filter: 'blur(10px)' }}
      transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="workflow-visual__chrome">
        <span />
        <span />
        <span />
      </div>
      <div className="workflow-visual__grid" aria-hidden="true" />
      <div className="workflow-visual__inner">{renderVisual()}</div>
    </motion.div>
  );
}

function WorkflowTabs({ step, activeTab, onTabChange }) {
  const content = activeTab === 'weDo' ? step.weDo : step.clientDoes;

  return (
    <div className="workflow-tabs">
      <div className="workflow-tabs__controls" role="tablist" aria-label={`Вкладки этапа ${step.title}`}>
        <button
          type="button"
          className={activeTab === 'weDo' ? 'is-active' : ''}
          role="tab"
          aria-selected={activeTab === 'weDo'}
          onClick={(event) => {
            event.stopPropagation();
            onTabChange('weDo');
          }}
        >
          Что делаем мы
        </button>
        <button
          type="button"
          className={activeTab === 'client' ? 'is-active' : ''}
          role="tab"
          aria-selected={activeTab === 'client'}
          onClick={(event) => {
            event.stopPropagation();
            onTabChange('client');
          }}
        >
          Что нужно от клиента
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          className="workflow-tabs__content"
          key={`${step.id}-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {content}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function WorkflowStepCard({
  step,
  index,
  isActive,
  onSelect,
  registerStep,
  activeTab,
  onTabChange,
}) {
  const stepNumber = String(index + 1).padStart(2, '0');

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  return (
    <motion.article
      ref={(node) => registerStep(index, node)}
      data-workflow-index={index}
      className={isActive ? 'workflow-step is-active' : 'workflow-step'}
      onClick={() => onSelect(index)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.42, delay: index * 0.035, ease: [0.2, 0.8, 0.2, 1] }}
      aria-label={`${stepNumber}. ${step.title}`}
    >
      <span className="workflow-step__dot" aria-hidden="true" />
      <div className="workflow-step__mobile-visual">
        <WorkflowVisual step={step} compact />
      </div>

      <div className="workflow-step__header">
        <span>{stepNumber}</span>
        <strong>{step.title}</strong>
      </div>
      <p>{step.description}</p>
      <div className="workflow-step__tags">
        {step.tags.map((tag) => (
          <em key={tag}>{tag}</em>
        ))}
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            className="workflow-step__details"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <WorkflowTabs step={step} activeTab={activeTab} onTabChange={onTabChange} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

function WorkflowTimeline({
  activeIndex,
  activeTab,
  onStepSelect,
  onTabChange,
  progressScale,
  registerStep,
}) {
  return (
    <div className="workflow-timeline">
      <div className="workflow-progress" aria-hidden="true">
        <motion.span style={{ scaleY: progressScale }} />
      </div>

      {workflowSteps.map((step, index) => (
        <WorkflowStepCard
          step={step}
          index={index}
          isActive={activeIndex === index}
          onSelect={onStepSelect}
          registerStep={registerStep}
          activeTab={activeTab}
          onTabChange={onTabChange}
          key={step.id}
        />
      ))}
    </div>
  );
}

function WorkflowSection() {
  const sectionRef = useRef(null);
  const stepRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('weDo');
  const activeStep = workflowSteps[activeIndex] ?? workflowSteps[0];
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });
  const progressScale = useTransform(scrollYProgress, [0.02, 0.94], [0, 1]);

  useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean);

    if (!nodes.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) {
          return;
        }

        const nextIndex = Number(visibleEntries[0].target.dataset.workflowIndex);

        if (Number.isFinite(nextIndex)) {
          setActiveIndex(nextIndex);
        }
      },
      {
        threshold: [0.22, 0.42, 0.62],
        rootMargin: '-34% 0px -42% 0px',
      },
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setActiveTab('weDo');
  }, [activeIndex]);

  const registerStep = (index, node) => {
    stepRefs.current[index] = node;
  };

  const handleStepSelect = (index) => {
    setActiveIndex(index);
    stepRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section ref={sectionRef} id="workflow" className="workflow-section" aria-labelledby="workflow-title">
      <div className="workflow-grain" aria-hidden="true" />

      <motion.header
        className="workflow-heading"
        initial={{ opacity: 0, y: 30, filter: 'blur(14px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.42 }}
        transition={{ duration: 0.72, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">Формат работы</p>
        <h2 id="workflow-title">От задачи до готового видеопродукта</h2>
        <p>
          Мы заранее выстраиваем процесс: понимаем задачу, формулируем идею, готовим съёмку,
          производим материал и передаём версии под нужные площадки.
        </p>
      </motion.header>

      <div className="workflow-layout">
        <aside className="workflow-visual-column" aria-label="Визуал активного этапа">
          <div className="workflow-sticky">
            <div className="workflow-sticky__topline">
              <span>{String(activeIndex + 1).padStart(2, '0')} / {String(workflowSteps.length).padStart(2, '0')}</span>
              <em>{activeStep.title}</em>
            </div>
            <AnimatePresence mode="wait">
              <WorkflowVisual step={activeStep} key={activeStep.id} />
            </AnimatePresence>
          </div>
        </aside>

        <WorkflowTimeline
          activeIndex={activeIndex}
          activeTab={activeTab}
          onStepSelect={handleStepSelect}
          onTabChange={setActiveTab}
          progressScale={progressScale}
          registerStep={registerStep}
        />
      </div>

      <motion.footer
        className="workflow-result"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.42 }}
        transition={{ duration: 0.58, ease: 'easeOut' }}
      >
        <p>
          В результате вы получаете не просто видеофайл, а готовый набор материалов, который можно
          сразу использовать в коммуникации, рекламе и продажах.
        </p>
        <a className="button button--primary" href="#contact">
          Обсудить проект
        </a>
      </motion.footer>
    </section>
  );
}

function CinemaCameraModel({ rotationRef }) {
  const rig = useRef(null);
  const gltf = useLoader(GLTFLoader, cameraModelUrl);

  const { scene, scale } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      if (object.material) {
        object.material = object.material.clone();
        object.material.roughness = Math.max(object.material.roughness ?? 0.45, 0.28);
        object.material.metalness = object.material.metalness ?? 0.35;
        object.material.envMapIntensity = Math.max(object.material.envMapIntensity ?? 0, 0.65);
        object.material.needsUpdate = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    clonedScene.position.sub(center);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    return {
      scene: clonedScene,
      scale: 5.55 / maxDimension,
    };
  }, [gltf]);

  useFrame(() => {
    if (rig.current) {
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, rotationRef.current, 0.12);
    }
  });

  return (
    <group ref={rig} position={[0, -0.18, 0]} rotation={[0.02, rotationRef.current, 0]} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

function CameraLoadingFallback() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.2, 1.1, 0.9]} />
        <meshStandardMaterial color="#252b34" roughness={0.6} metalness={0.35} />
      </mesh>
      <mesh position={[-1.45, 0, 0.28]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.52, 0.9, 48]} />
        <meshStandardMaterial color="#08090b" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

function OrbitCameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef(null);

  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minDistance = 3.3;
    controls.maxDistance = 8.2;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.75;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI - 0.16;
    controls.target.set(0, -0.05, 0);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}

function CameraScene({ rotationRef }) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [3.25, 1.05, 5.2], fov: 31 }}
      dpr={[1, 1.7]}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.35;
      }}
      shadows
    >
      <hemisphereLight args={['#dfe8ff', '#110907', 1.05]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3.8, 5.2, 5.6]} intensity={4.4} color="#f3f6ff" castShadow />
      <spotLight position={[-4.6, 3.2, 4.2]} intensity={3.6} angle={0.5} penumbra={0.74} color="#ff6a2a" />
      <pointLight position={[2.6, -0.3, 3.2]} intensity={3.2} color="#86b5ff" />
      <pointLight position={[-3.2, 0.8, 2.6]} intensity={2.4} color="#ffffff" />
      <Suspense fallback={<CameraLoadingFallback />}>
        <CinemaCameraModel rotationRef={rotationRef} />
      </Suspense>
      <OrbitCameraControls />
    </Canvas>
  );
}

function HeroVisual() {
  const rotationRef = useRef(0);

  return (
    <div
      className="hero-visual"
      aria-label="Реалистичная 3D-камера. Вращайте модель мышью или пальцем и приближайте колесом."
    >
      <motion.div
        className="camera-stage"
        data-cursor="camera"
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="viewfinder viewfinder--top-left" />
        <div className="viewfinder viewfinder--top-right" />
        <div className="viewfinder viewfinder--bottom-left" />
        <div className="viewfinder viewfinder--bottom-right" />

        <div className="rec-badge">
          <span />
          REC
        </div>
        <div className="timecode">00:01:24:08</div>

        <div className="focus-lines" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="camera-canvas">
          <CameraScene rotationRef={rotationRef} />
        </div>

        <div className="camera-tags">
          {cameraTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <main className="site-shell">
      <CustomCursor />
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="grain" aria-hidden="true" />

        <motion.header
          className="hero-header"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <a className="logo-link" href="/" aria-label="ChuDo Production">
            <img src={logo} alt="ChuDo" />
          </a>
          <AnchorNav />
          <div className="header-meta">Видеопродакшн · Бишкек</div>
        </motion.header>

        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className="eyebrow">Коммерческое предложение · 2026</p>
            <h1 id="hero-title">
              <BlurText text="Видео," delay={180} stepDelay={55} />{' '}
              <span><BlurText text="которое работает" delay={360} stepDelay={50} /></span>{' '}
              <BlurText text="после просмотра." delay={660} stepDelay={50} />
            </h1>
            <p className="lead">
              Ролики, имиджевые фильмы и контент для строительных, автомобильных и B2B-компаний —
              чтобы продукт было проще показать, объяснить и продать.
            </p>
            <div className="hero-actions">
              <a className="button button--primary button--shimmer" href="#contact">
                Обсудить проект
              </a>
              <a className="button button--ghost" href="#offer">
                Смотреть предложение
              </a>
            </div>
          </motion.div>

          <HeroVisual />
        </div>

        <footer className="hero-footer">
          <AnchorNav compact />
          <a className="scroll-hint" href="#market-pains" aria-label="Перейти к следующему блоку">
            <span>scroll</span>
            <i />
          </a>
        </footer>
      </section>

      <MarketPainsSection />
      <OfferSection />
      <UniqueValueSection />
      <CasesSection />
      <WorkflowSection />
    </main>
  );
}

export default App;
