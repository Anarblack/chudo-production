import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import logo from '../assets/chudo-logo-new.png';
import cameraModelUrl from '../assets/red_camera_web.glb?url';
import CustomCursor from './components/CustomCursor.jsx';
import BlurText from './components/BlurText.jsx';
import PartnersSection from './components/PartnersSection.jsx';
import ContactSection from './components/ContactSection.jsx';

// Prevents IntersectionObserver from changing accordion state during anchor-scroll,
// which would shift the page height and cause smooth scroll to land at the wrong target.
let _anchorScrollActive = false;
let _anchorScrollTimer = null;

function _startAnchorScroll() {
  _anchorScrollActive = true;
  clearTimeout(_anchorScrollTimer);
  // 1300ms covers any smooth-scroll distance on this page; unblocks IntersectionObserver after landing
  _anchorScrollTimer = setTimeout(() => { _anchorScrollActive = false; }, 1300);
}

const navItems = [
  { label: 'Проблемы рынка', href: '#market-pains' },
  { label: 'Решения',        href: '#offer' },
  { label: 'Наш подход',     href: '#usp' },
  { label: 'Работы',         href: '#cases' },
  { label: 'Как работаем',   href: '#workflow' },
  { label: 'Партнёры',       href: '#partners' },
  { label: 'Контакты',       href: '#contact' },
];

const cameraTags = ['rotate 360°', 'zoom ready', 'client frame'];

const painScenes = [
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

const painMotionProfiles = [
  { x: 0, y: 64, rotate: 0, scale: 0.94, exitX: 0, exitY: -46, exitRotate: 0 },
  { x: -76, y: 0, rotate: -1.4, scale: 0.96, exitX: 70, exitY: 0, exitRotate: 1.4 },
  { x: 62, y: 30, rotate: 1, scale: 0.94, exitX: -42, exitY: -38, exitRotate: -1 },
  { x: 0, y: -38, rotate: 0.7, scale: 1.04, exitX: 0, exitY: 42, exitRotate: -0.7 },
  { x: -36, y: 54, rotate: -2, scale: 0.9, exitX: 30, exitY: -52, exitRotate: 2 },
  { x: 0, y: 24, rotate: 0, scale: 0.88, exitX: 0, exitY: -28, exitRotate: 0 },
];

const painItemVariants = {
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

const services = [
  {
    title: 'Рекламные ролики для продукта и услуги',
    description: 'Короткие промо-видео для запуска, продвижения и объяснения продукта, услуги, объекта или бренда.',
    tags: ['Promo', 'Product', 'Launch'],
    visualTheme: {
      accent: '#f05a28',
      glow: 'rgba(240, 90, 40, 0.28)',
    },
  },
  {
    title: 'Контент-пакеты для соцсетей',
    description: 'Из одной съёмки собираем систему материалов: Reels, Shorts, Stories, обложки и версии под разные площадки.',
    tags: ['Reels', 'Shorts', 'Stories'],
    visualTheme: {
      accent: '#a78bff',
      glow: 'rgba(167, 139, 255, 0.22)',
    },
  },
  {
    title: 'Имиджевые и бренд-ролики',
    description: 'Видео, которое формирует образ компании: стиль, доверие, масштаб, атмосфера и сильные стороны бренда.',
    tags: ['Brand', 'Trust', 'Image'],
    visualTheme: {
      accent: '#d8dde7',
      glow: 'rgba(216, 221, 231, 0.22)',
    },
  },
  {
    title: 'Видео для отдела продаж',
    description: 'Материалы для сайта, КП, WhatsApp, CRM, презентаций и рассылок, чтобы менеджеру было проще показать ценность клиенту.',
    tags: ['Sales', 'CRM', 'WhatsApp'],
    visualTheme: {
      accent: '#79d7b6',
      glow: 'rgba(121, 215, 182, 0.2)',
    },
  },
  {
    title: 'Обзоры продуктов, объектов и техники',
    description: 'Авто, недвижимость, оборудование, пространства и товары: показываем детали, преимущества и сценарии использования.',
    tags: ['Review', 'Object', 'Details'],
    visualTheme: {
      accent: '#b9c6d9',
      glow: 'rgba(185, 198, 217, 0.22)',
    },
  },
  {
    title: 'Event-видео',
    description: 'Aftermovie, highlights, backstage и промо события: эмоции, гости, площадка, динамика и атмосфера.',
    tags: ['Event', 'Highlights', 'Backstage'],
    visualTheme: {
      accent: '#d74b52',
      glow: 'rgba(215, 75, 82, 0.24)',
    },
  },
  {
    title: 'Экспертный и B2B-контент',
    description: 'Интервью, руководители, команда, кейсы и объяснение сложных услуг простым языком.',
    tags: ['B2B', 'Expert', 'Trust'],
    visualTheme: {
      accent: '#f1efe8',
      glow: 'rgba(241, 239, 232, 0.18)',
    },
  },
  {
    title: 'AI и креативные видеоформаты',
    description: 'Музыкальные клипы, AI-вставки и нестандартные визуальные решения, когда ролику нужен более смелый стиль.',
    tags: ['AI', 'Creative', 'Music clip'],
    visualTheme: {
      accent: '#8fb8ff',
      glow: 'rgba(143, 184, 255, 0.24)',
    },
  },
];

function driveVideo(fileId) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

function driveView(fileId) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function driveThumbnail(fileId) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

function makeDriveVideo(fileId, options = {}) {
  return {
    provider: 'drive',
    fileId,
    full: driveVideo(fileId),
    external: driveView(fileId),
    thumbnail: driveThumbnail(fileId),
    ...options,
  };
}

function makeVideoSet(videos, options = {}) {
  const firstVideo = videos[0] ?? {};

  return {
    ...firstVideo,
    ...options,
    playlist: videos.map((video) => ({
      ...video,
      poster: video.poster ?? options.poster,
    })),
  };
}

function makeDriveVideos(entries) {
  return entries.map(([fileId, label]) => makeDriveVideo(fileId, { label }));
}

const projectVideos = {
  adidas: makeDriveVideos([
    ['1VHPK5R_tjqYV61yBrvn1L1Go6pLLLwW1', '1.mov'],
    ['1DfLaZxEqBkjDvxs2eldOzwjWTIkitRUJ', '2.mp4'],
    ['1IkDde365JsdioIaCFuoe8LpUcQB_jBLc', '3.mov'],
  ]),
  alatoo: makeDriveVideos([
    ['1J_1bCDrQHQPgla-EsAMPz_wslnR8W1Cu', '1.mp4'],
    ['1JcK83IHsCvLwwac8JYhHqL3eTcFWMyyn', '2.mp4'],
    ['1a4ohYEt_bI-UIcBfJWx3pR9MV1AYHE88', '3.mov'],
    ['1uEua-LEuB9jQ73kF2FNL_HLk_ypV4tHd', '4.mp4'],
  ]),
  asab: makeDriveVideos([
    ['17liSyYVtImTeRojjEnUOURA30gm9yJo2', '1.mp4'],
  ]),
  asylsu: makeDriveVideos([
    ['16g90albOpWyllqvlOHUBru6sKe9sOcDm', '1.mov'],
  ]),
  avangard: makeDriveVideos([
    ['1ASTGu7_Q28dHthkKEsg_B21PrX49W2iU', '1.mp4'],
    ['1ASwYfsCnRHpdcYwQho8hs62GU9Yxma2T', '2.mp4'],
    ['1HghZ06c22ZiKHSJcaYfg9Y4EKJklzSBt', '3.mp4'],
    ['19qootdkvuQkGaYzLSqQ5fN_pVjTAgCZu', '4.mp4'],
  ]),
  aviasales: makeDriveVideos([
    ['1pSVcpygr3FpGd9JWu6pgRuBEGI7itork', '1.mp4'],
    ['147RmNkWmHdmEnXn-dy_amcwtrNkg3A3y', '2.mp4'],
  ]),
  chevrolet: makeDriveVideos([
    ['1izhQXJhOHNYUylhEw6gvSAh4q_2Lsild', '1.mp4'],
    ['1iaWus22Vv9su1yIpDWuFDvhc3FYZkKLz', '2.mp4'],
    ['1b98iRV-n-wRzjkthPjeKJnpmomAfefX5', '3.mp4'],
    ['1DyaJaYK2nN0WmD0bu65wJuQgcddy6C9V', '4.mov'],
    ['1QKp9mrvVC80x3J_eWuNa6W3u0zvw_GLD', '5.mp4'],
    ['1DO3mGYA6Zp6qlVSurher-mJJKPGVQYOT', '6.mp4'],
    ['1uWBA7OHcG6Wpv_w8d9TD9p6PCLPCFCGQ', '7.mp4'],
    ['1C9TmQGkuvBOE9reJaLjcms3RmEJas_je', '8.mp4'],
    ['1NGyiGAZKwF1v0fjqFmukzoMAX3Jba6py', 'AI 1'],
    ['1UNFjAdiD-VF4hUmSVPu6AjCjfen4F0Ew', 'AI 2'],
    ['19YBRVQ4cPy03Zzg8Tm-OhTU_5IRrUIJ2', 'AI 3'],
  ]),
  contentPack: makeDriveVideos([
    ['1mBZISGnU1RpH7j1KBImQPd-JMC2rK94p', 'Juice 1'],
    ['1LX7SSZjsT4xFC3IV4MlZtHkvaYhzUNi4', 'Juice 2'],
  ]),
  kia: makeDriveVideos([
    ['1b4AuFxVdcNEn9yOxKauANt1of7vuZ6gY', '1.mp4'],
    ['1hyzszKbngFvWVngtPB9Hg984tOMuf4Ax', '2.mp4'],
    ['1aIUl5Y0rtFvb2_VZjmXAT0T11el693kQ', '3.mp4'],
    ['1qXz7AyltiXHsGwd4LG_IPiNgji0itmLc', '4.mp4'],
    ['1QW0b7zr9L83J5DGVCg4hPBVyLfk0JNXh', '5.mp4'],
  ]),
  letsgo: makeDriveVideos([
    ['1fW0DlF9QWwOUbzDSGn4HGdanyx6IaQKb', '1.mp4'],
  ]),
  mrbbq: makeDriveVideos([
    ['1ZahuAYFgQX-aRFCBaOrXHNN6Ds5oVvwb', '1.mp4'],
  ]),
  ngroup: makeDriveVideos([
    ['1l8JtkgvnBxqsIAHod1wYMBNai8LBui9e', '1.mp4'],
    ['1MIXKTTJupViDYPzcdzNDU9OZEhLStJZH', '2.mov'],
    ['1lcc1b6Z1UdjQqE66XmrECwkbkSajHqEt', '3.mp4'],
    ['1O5xtQ-H4OkbDh8qdPPCHqQ8m-AipdhD8', 'AI 1'],
  ]),
  roxy: makeDriveVideos([
    ['1PeEoxijPSQBizFImlHV1nLNdnCGaofWv', '1.mp4'],
    ['10WqjceGrWR-wAsjUKVjh1j2g9hiuydo6', '2.mp4'],
    ['1cL4yco8aIwuHqS7CT0xPa3mkczE8bVXZ', '3.mp4'],
  ]),
  vibe: makeDriveVideos([
    ['1bI4fWsdOUi65WPyGiy9mSr7EAS8GbQpY', '1.mov'],
    ['1fvYuc3dr4pIRaTBQcTZmMwDHMDPlSSgG', '2.mov'],
  ]),
  event: makeDriveVideos([
    ['1_F1jA1gR8-Y1O3sQTxLPSa6LEmM6y9ns', 'WHITE NIGHT'],
    ['1UfBrdYyvs0FWvjkvfFEfWcMwZPmUlZWC', 'Стервятник 2'],
    ['1tQ7l03n6itgAMrS0QvczjFxiFDfGebpq', 'Стервятник'],
  ]),
  xcomp: makeDriveVideos([
    ['1AfFereLiQuP4Ja85FHW9E9rpe1kxZXdj', '1.mp4'],
  ]),
  expert: makeDriveVideos([
    ['1CvBIa_mHLXesQWD0OpNV_VxppEohCtf-', '1.mp4'],
    ['13XV_IjQRzg5oTvMapqtwumstce6QQ1-c', '2.mp4'],
    ['1LaPz_qc1uuN631QqPIDYRSQ1CDQXh57x', '3.mp4'],
    ['13UVr_Qmm5O_vEPQk5pX0QcJg9q0TyA66', '4.mp4'],
    ['1f_mp1D-9aopG9crZFqBmQQkR5Weq33rs', '5.mp4'],
    ['1jvUDkj7F0U7tkRJbtjNI1Ch7AFjYagTA', '6.mp4'],
  ]),
  creative: makeDriveVideos([
    ['19YBRVQ4cPy03Zzg8Tm-OhTU_5IRrUIJ2', 'AI 3'],
    ['1NGyiGAZKwF1v0fjqFmukzoMAX3Jba6py', 'AI 1'],
    ['1UNFjAdiD-VF4hUmSVPu6AjCjfen4F0Ew', 'AI 2'],
    ['1as1kbkeIrkT83hBa7ur3NhwcqywPqo8d', '7gen Freeman'],
    ['1RJEfIG_Y0TGrBp1br2PPUqAXyhwajZ9O', 'AITU Bounce'],
    ['1mhHUhHPz5cU-5fXX4LHmlZCZJD2BVM8n', 'BAKR Freeman'],
    ['1G85WxpkhhdzcNeXBHiid-0Uq0TZHLycl', 'Freeman x Aihan'],
    ['1xsb533RfySe--0aJXqV9jo1IkyeAZuHS', 'ISAEW'],
    ['1MZogED6aEM73E1hauhLkMqdaJ0XFOe25', 'Qanysh Bayas'],
    ['1D2s4VEH2M2KqW6aJdvxiTelj3oVRIewE', 'Ulukmanap & BAPAY'],
  ]),
  shortFilm: makeDriveVideos([
    ['1CyixkwzKfaDZ__KqcPvtMYZH09wJGE-3', 'Жылдыздын Кыялы'],
  ]),
  fashionBrand: makeDriveVideos([
    ['1U_FgmO8sVNV7qW0d_mPLkyUbRWL8dMAO', 'Бренд одежды'],
  ]),
  upsm: makeDriveVideos([
    ['1Ryrd3NxRyyOctihArlHIcLd5vRLGwJO-', '1.mp4'],
  ]),
  product: makeDriveVideos([
    ['1vgKug9XElsmd5mzmgvQcXrdsdBeY4Ird', 'ЦУМ GOLD'],
  ]),
  shtuchki: makeDriveVideos([
    ['1Mg_HDqw1VGxPlQEw4Hlio-rX8tZ7ZEwE', '1.mp4'],
    ['1LcLy_jlcP0nOf0cGSjG8DvGaClSZ6h37', '2.mp4'],
  ]),
};

const portfolioItems = [
  {
    id: 'chevrolet-model',
    title: 'Chevrolet — модельный ролик',
    category: 'Авто',
    serviceType: 'Рекламные ролики для продукта и услуги',
    image: '/portfolio/chevrolet-01.svg',
    media: makeVideoSet(projectVideos.chevrolet, {
      poster: '/portfolio/chevrolet-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Короткий промо-ролик для продвижения модели.',
  },
  {
    id: 'content-pack',
    title: 'Content Pack — серия материалов',
    category: 'Система контента',
    serviceType: 'Контент-пакеты для соцсетей',
    image: '/portfolio/content-pack-01.svg',
    media: makeVideoSet(projectVideos.contentPack, {
      poster: '/portfolio/content-pack-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Главный ролик, вертикальные видео, нарезки и обложки из одной съёмки.',
  },
  {
    id: 'brand-image',
    title: 'Brand — имиджевый ролик',
    category: 'Бренд',
    serviceType: 'Имиджевые и бренд-ролики',
    image: '/portfolio/brand-01.svg',
    media: makeVideoSet(projectVideos.vibe, {
      poster: '/portfolio/brand-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Визуальная история бренда, атмосфера и доверие.',
  },
  {
    id: 'ngroup-object',
    title: 'Ngroup — объект недвижимости',
    category: 'Продажи',
    serviceType: 'Видео для отдела продаж',
    image: '/portfolio/ngroup-01.svg',
    media: makeVideoSet(projectVideos.ngroup, {
      poster: '/portfolio/ngroup-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Материал для сайта, КП и отправки клиентам после заявки.',
  },
  {
    id: 'product-review',
    title: 'Product — видеообзор объекта',
    category: 'Обзор',
    serviceType: 'Обзоры продуктов, объектов и техники',
    image: '/portfolio/product-01.svg',
    media: makeVideoSet(projectVideos.product, {
      poster: '/portfolio/product-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Понятная демонстрация деталей, масштаба и преимуществ продукта.',
  },
  {
    id: 'event-aftermovie',
    title: 'Event — aftermovie',
    category: 'Event',
    serviceType: 'Event-видео',
    image: '/portfolio/event-01.svg',
    media: makeVideoSet(projectVideos.event, {
      poster: '/portfolio/event-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Атмосферный ролик с мероприятия.',
  },
  {
    id: 'expert-interview',
    title: 'Expert — B2B-интервью',
    category: 'Экспертность',
    serviceType: 'Экспертный и B2B-контент',
    image: '/portfolio/interview-01.svg',
    media: makeVideoSet(projectVideos.expert, {
      poster: '/portfolio/interview-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Контент с экспертом для доверия, объяснения и прогрева аудитории.',
  },
  {
    id: 'creative-ai',
    title: 'AI / Music — креативный формат',
    category: 'Креатив',
    serviceType: 'AI и креативные видеоформаты',
    image: '/portfolio/production-01.svg',
    media: makeVideoSet(projectVideos.creative, {
      preview: '/videos/ai-creative.mp4',
      poster: '/portfolio/production-01.svg',
    }),
    videoUrl: '#',
    portfolioUrl: '#',
    description: 'Смелая визуальная подача, AI-вставки и клиповая динамика.',
  },
];

const comparisonItems = [
  {
    ordinary: 'Снять и отдать файл',
    chudo: 'Стратегия до первого кадра',
    description: 'Начинаем с вопроса: что должен сделать зритель после просмотра? Покупка, доверие, заявка или узнаваемость — от этого выстраивается весь ролик.',
    tags: ['Strategy', 'Goal', 'Brief'],
    icon: '◎',
  },
  {
    ordinary: 'Сценарий по ходу съёмки',
    chudo: 'Идея, сценарий и раскадровка',
    description: 'До выезда на площадку прописываем каждую сцену, сообщение и визуальный стиль. Съёмка идёт по плану — без хаоса и переделок.',
    tags: ['Script', 'Storyboard', 'Prep'],
    icon: '⬡',
  },
  {
    ordinary: 'Один итоговый ролик',
    chudo: 'Контент-система из одной съёмки',
    description: 'Главный ролик, короткие версии, Reels, Stories, видео для WhatsApp и сайта — всё из одной производственной сессии.',
    tags: ['Content system', 'Reels', 'Stories'],
    icon: '⬢',
  },
  {
    ordinary: 'Видео публикуется и забывается',
    chudo: 'Видео работает в продажах',
    description: 'Делаем форматы, которые менеджеры отправляют клиентам после звонка, встречи или заявки. Видео становится инструментом, а не контентом.',
    tags: ['Sales', 'CRM', 'WhatsApp'],
    icon: '▲',
  },
  {
    ordinary: 'Результат непредсказуем',
    chudo: 'Полный цикл под ключ',
    description: 'Бриф → идея → сценарий → съёмка → монтаж → цветокоррекция → звук → финальные версии. Один контакт, прозрачный процесс, понятный результат.',
    tags: ['Full cycle', 'Production', 'Post'],
    icon: '◈',
  },
];

const caseFilters = ['Все', 'Авто', 'Недвижимость', 'Бренды', 'FMCG', 'Event', 'Музыка', 'B2B'];

function makeCase({
  id,
  title,
  category,
  type,
  task,
  solution,
  formats,
  tags,
  image,
  videos,
  featured = false,
}) {
  return {
    id,
    title,
    category,
    type,
    task,
    solution,
    formats,
    tags,
    image,
    videos,
    video: makeVideoSet(videos, { poster: image }),
    featured,
  };
}

const cases = [
  makeCase({
    id: 'chevrolet',
    title: 'Chevrolet',
    category: 'Авто',
    type: 'Рекламные ролики',
    task: 'Показать модельный ряд через динамику, детали автомобиля и ощущение владения.',
    solution: 'Серия промо-роликов с акцентом на движение, экстерьер, интерьер и эмоциональное восприятие.',
    formats: ['Hero video', 'AI cut', 'Social cuts'],
    tags: ['Авто', 'Реклама', 'Digital'],
    image: '/portfolio/chevrolet-01.svg',
    videos: projectVideos.chevrolet,
    featured: true,
  }),
  makeCase({
    id: 'kia',
    title: 'KIA',
    category: 'Авто',
    type: 'Контент для дилера',
    task: 'Собрать серию роликов для продвижения автомобилей в digital и соцсетях.',
    solution: 'Видео с акцентом на внешний вид, салон, детали и сценарии использования машины.',
    formats: ['Reels', 'Shorts', 'Model video'],
    tags: ['Авто', 'Соцсети', 'Контент'],
    image: '/portfolio/kia-01.svg',
    videos: projectVideos.kia,
  }),
  makeCase({
    id: 'avangard',
    title: 'Avangard',
    category: 'Недвижимость',
    type: 'Видео жилого комплекса',
    task: 'Показать объект, инфраструктуру и атмосферу будущей жизни.',
    solution: 'Презентационные видеоматериалы для сайта, соцсетей, отдела продаж и точек контакта с клиентами.',
    formats: ['Main video', 'Sales version', 'Social cuts'],
    tags: ['ЖК', 'Недвижимость', 'Продажи'],
    image: '/portfolio/avangard-01.svg',
    videos: projectVideos.avangard,
    featured: true,
  }),
  makeCase({
    id: 'ngroup',
    title: 'NGROUP',
    category: 'Недвижимость',
    type: 'Презентационное видео',
    task: 'Визуально упаковать строительный объект для клиентов, сайта и презентаций.',
    solution: 'Видео с акцентом на архитектуру, пространство, детали объекта и доверие к девелоперу.',
    formats: ['Presentation video', 'AI cut', 'Sales material'],
    tags: ['Строительство', 'Презентация', 'Объект'],
    image: '/portfolio/ngroup-01.svg',
    videos: projectVideos.ngroup,
  }),
  makeCase({
    id: 'adidas',
    title: 'ADIDAS',
    category: 'Бренды',
    type: 'Fashion / sport promo',
    task: 'Передать энергию бренда через движение, стиль и динамичный монтаж.',
    solution: 'Серия визуальных роликов с фокусом на ритм, продукт, образ и узнаваемость.',
    formats: ['Brand film', 'Short cuts', 'Lifestyle'],
    tags: ['Бренды', 'Fashion', 'Sport'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.adidas,
  }),
  makeCase({
    id: 'alatoo',
    title: 'Ala-Too',
    category: 'Бренды',
    type: 'Имиджевый контент',
    task: 'Собрать визуальный материал, который показывает среду, людей и атмосферу проекта.',
    solution: 'Серия роликов с живой подачей, деталями пространства и понятной визуальной структурой.',
    formats: ['Image video', 'Social cuts', 'Promo'],
    tags: ['Образование', 'Имидж', 'Digital'],
    image: '/portfolio/interview-01.svg',
    videos: projectVideos.alatoo,
  }),
  makeCase({
    id: 'asab',
    title: 'ASAB',
    category: 'Бренды',
    type: 'Бренд-ролик',
    task: 'Показать продукт или бренд в чистой визуальной подаче для digital-размещения.',
    solution: 'Короткий ролик с акцентом на детали, настроение и аккуратную рекламную упаковку.',
    formats: ['Commercial', 'Short version', 'Digital'],
    tags: ['Бренды', 'Реклама', 'Digital'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.asab,
  }),
  makeCase({
    id: 'asylsu',
    title: 'Asylsu',
    category: 'FMCG',
    type: 'Product promo',
    task: 'Сделать продукт заметным и визуально чистым для рекламной коммуникации.',
    solution: 'Предметная и lifestyle-подача с фокусом на свежесть, качество и узнаваемость упаковки.',
    formats: ['Product video', 'Social cut', 'Promo'],
    tags: ['FMCG', 'Продукт', 'Реклама'],
    image: '/portfolio/product-01.svg',
    videos: projectVideos.asylsu,
  }),
  makeCase({
    id: 'aviasales',
    title: 'Aviasales',
    category: 'Бренды',
    type: 'Digital promo',
    task: 'Сделать короткий запоминающийся материал для бренда в travel/digital-среде.',
    solution: 'Динамичная подача с быстрым монтажом, понятным сообщением и лёгкой визуальной иронией.',
    formats: ['Digital video', 'Shorts', 'Promo'],
    tags: ['Бренды', 'Travel', 'Digital'],
    image: '/portfolio/production-01.svg',
    videos: projectVideos.aviasales,
  }),
  makeCase({
    id: 'juice',
    title: 'Juice',
    category: 'FMCG',
    type: 'Контент-пакет',
    task: 'Собрать визуальные материалы для продукта и дальнейшего использования в соцсетях.',
    solution: 'Серия роликов с продуктовой подачей, цветом, динамикой и короткими версиями.',
    formats: ['Content pack', 'Reels', 'Product promo'],
    tags: ['FMCG', 'Соцсети', 'Контент'],
    image: '/portfolio/content-pack-01.svg',
    videos: projectVideos.contentPack,
  }),
  makeCase({
    id: 'letsgo',
    title: "Let's go",
    category: 'Бренды',
    type: 'Promo video',
    task: 'Собрать короткий рекламный материал с понятным настроением и быстрым входом в бренд.',
    solution: 'Динамичный ролик с акцентом на визуальную идентичность и простую digital-подачу.',
    formats: ['Promo', 'Short version', 'Digital'],
    tags: ['Бренды', 'Реклама', 'Digital'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.letsgo,
  }),
  makeCase({
    id: 'mr-bbq',
    title: 'MR.BBQ',
    category: 'FMCG',
    type: 'Food promo',
    task: 'Показать продукт аппетитно, просто и достаточно ярко для соцсетей.',
    solution: 'Продуктовая съёмка с фокусом на фактуру, процесс и желание попробовать.',
    formats: ['Product video', 'Food content', 'Reels'],
    tags: ['FMCG', 'Food', 'Соцсети'],
    image: '/portfolio/product-01.svg',
    videos: projectVideos.mrbbq,
  }),
  makeCase({
    id: 'roxy',
    title: 'ROXY',
    category: 'Бренды',
    type: 'Имиджевый контент',
    task: 'Показать бренд через стиль, детали и визуальное настроение.',
    solution: 'Серия роликов для соцсетей и digital с фокусом на образ, ритм и визуальную чистоту.',
    formats: ['Brand film', 'Reels', 'Short cuts'],
    tags: ['Бренды', 'Image', 'Social'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.roxy,
  }),
  makeCase({
    id: 'vibe',
    title: 'VIBE',
    category: 'Бренды',
    type: 'Brand film',
    task: 'Передать настроение бренда через визуальную историю и атмосферу.',
    solution: 'Имиджевые ролики с фокусом на образ, детали, свет и узнаваемый стиль.',
    formats: ['Brand film', 'Social cuts', 'Short version'],
    tags: ['Бренды', 'Image', 'Commercial'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.vibe,
  }),
  makeCase({
    id: 'white-night',
    title: 'WHITE NIGHT',
    category: 'Event',
    type: 'Aftermovie',
    task: 'Передать атмосферу события и оставить материал для дальнейшего продвижения.',
    solution: 'Динамичный aftermovie с ключевыми моментами, людьми, площадкой и настроением вечера.',
    formats: ['Aftermovie', 'Highlights', 'Stories'],
    tags: ['Event', 'Atmosphere', 'Promo'],
    image: '/portfolio/event-01.svg',
    videos: [projectVideos.event[0]],
  }),
  makeCase({
    id: 'xcomp',
    title: 'XCOMP',
    category: 'B2B',
    type: 'Корпоративный ролик',
    task: 'Упаковать услугу или компанию в понятный видеоматериал для digital и продаж.',
    solution: 'Лаконичный ролик с деловой подачей, структурой и акцентом на пользу для клиента.',
    formats: ['B2B video', 'Presentation', 'Digital'],
    tags: ['B2B', 'Услуги', 'Продажи'],
    image: '/portfolio/interview-01.svg',
    videos: projectVideos.xcomp,
  }),
  makeCase({
    id: 'bank-kompanion',
    title: 'Банк Компаньон',
    category: 'B2B',
    type: 'Экспертный контент',
    task: 'Собрать серию материалов для доверия, объяснения продукта и коммуникации с аудиторией.',
    solution: 'Серия роликов с аккуратной структурой, понятной подачей и деловым визуальным тоном.',
    formats: ['Expert video', 'B2B content', 'Social cuts'],
    tags: ['B2B', 'Финансы', 'Экспертность'],
    image: '/portfolio/interview-01.svg',
    videos: projectVideos.expert,
  }),
  makeCase({
    id: 'music-clips',
    title: 'Музыкальные клипы',
    category: 'Музыка',
    type: 'Music video',
    task: 'Создать визуальные истории для артистов с клиповой динамикой и характером.',
    solution: 'Подборка музыкальных клипов с разной пластикой, монтажным ритмом и визуальным стилем.',
    formats: ['Music video', 'Creative cut', 'Performance'],
    tags: ['Музыка', 'Креатив', 'Clip'],
    image: '/portfolio/production-01.svg',
    videos: projectVideos.creative.slice(3),
    featured: true,
  }),
  makeCase({
    id: 'short-film',
    title: 'Жылдыздын Кыялы',
    category: 'Музыка',
    type: 'Короткий метр',
    task: 'Собрать художественный видеоматериал с настроением, драматургией и цельной визуальной линией.',
    solution: 'Короткометражный формат с фокусом на историю, атмосферу и кинематографичную подачу.',
    formats: ['Short film', 'Story', 'Cinema'],
    tags: ['Креатив', 'Кино', 'Музыка'],
    image: '/portfolio/production-01.svg',
    videos: projectVideos.shortFilm,
  }),
  makeCase({
    id: 'fashion-brand',
    title: 'Бренд одежды',
    category: 'Бренды',
    type: 'Fashion promo',
    task: 'Показать одежду через стиль, движение и визуальную эстетику бренда.',
    solution: 'Имиджевый fashion-ролик с акцентом на фактуру, силуэт, настроение и узнаваемость.',
    formats: ['Fashion video', 'Brand film', 'Social cut'],
    tags: ['Бренды', 'Fashion', 'Image'],
    image: '/portfolio/brand-01.svg',
    videos: projectVideos.fashionBrand,
  }),
  makeCase({
    id: 'upsm',
    title: 'УПСМ',
    category: 'B2B',
    type: 'Презентационное видео',
    task: 'Сделать понятный видеоматериал для организации, услуги или внутренней коммуникации.',
    solution: 'Структурная подача с деловым тоном, акцентом на процесс и доверие.',
    formats: ['Presentation', 'Corporate', 'Digital'],
    tags: ['B2B', 'Презентация', 'Услуги'],
    image: '/portfolio/interview-01.svg',
    videos: projectVideos.upsm,
  }),
  makeCase({
    id: 'tsum',
    title: 'ЦУМ GOLD',
    category: 'Бренды',
    type: 'Product review',
    task: 'Показать продукт, детали и премиальность через аккуратный визуальный обзор.',
    solution: 'Видеообзор с фокусом на фактуру, свет, крупные планы и ощущение качества.',
    formats: ['Product review', 'Promo', 'Digital'],
    tags: ['Бренды', 'Product', 'Обзор'],
    image: '/portfolio/product-01.svg',
    videos: projectVideos.product,
  }),
  makeCase({
    id: 'show',
    title: 'ШОУ',
    category: 'Event',
    type: 'Show content',
    task: 'Передать энергию шоу и собрать материал для продвижения формата.',
    solution: 'Два ролика с акцентом на сцену, эмоции, темп и атмосферу события.',
    formats: ['Showreel', 'Highlights', 'Promo'],
    tags: ['Event', 'Show', 'Promo'],
    image: '/portfolio/event-01.svg',
    videos: projectVideos.event.slice(1),
  }),
  makeCase({
    id: 'shtuchki',
    title: 'Штучки',
    category: 'FMCG',
    type: 'Product content',
    task: 'Сделать лёгкий продуктовый контент для соцсетей и digital-размещения.',
    solution: 'Короткие ролики с простым сообщением, быстрым монтажом и понятной продуктовой подачей.',
    formats: ['Product video', 'Reels', 'Social cuts'],
    tags: ['FMCG', 'Продукт', 'Соцсети'],
    image: '/portfolio/content-pack-01.svg',
    videos: projectVideos.shtuchki,
  }),
];

const workflowSteps = [
  {
    id: 1,
    title: 'Диагностика задачи',
    description: 'Разбираем, что именно должен сделать видеоконтент: продать, объяснить, усилить доверие, показать объект или собрать внимание к запуску.',
    weDo: 'Выясняем цель, аудиторию, точки контакта и бизнес-смысл ролика, чтобы не снимать просто красивое видео без функции.',
    clientDoes: 'Кратко описать проект, цель, сроки, продукт и показать примеры, которые нравятся или точно не подходят.',
    result: 'Понятная задача и роль видео в продажах',
    input: 'Запрос, продукт, сроки, желаемый эффект',
    artifacts: ['Карта задачи', 'Список площадок', 'Критерии результата'],
    checks: ['цель видео ясна', 'формат не выбран вслепую', 'понятна точка применения'],
    tags: ['Goal', 'Product', 'Audience', 'Channel'],
    visualType: 'request',
  },
  {
    id: 2,
    title: 'Бриф и позиционирование',
    description: 'Фиксируем сильные стороны продукта, возражения клиента, нужное впечатление и площадки, где материал будет жить.',
    weDo: 'Собираем вводные в рабочий бриф, выделяем ключевые сообщения, тон коммуникации и ограничения по съёмке.',
    clientDoes: 'Подтвердить факты, приоритеты, ограничения, важные преимущества и ответственного за согласование.',
    result: 'Бриф, от которого можно строить идею',
    input: 'Факты о продукте, аудитория, ограничения',
    artifacts: ['Рабочий бриф', 'Ключевые сообщения', 'Карта возражений'],
    checks: ['сильные стороны выделены', 'аудитория описана', 'тон коммуникации согласован'],
    tags: ['Brief', 'Message', 'USP', 'Platform'],
    visualType: 'brief',
  },
  {
    id: 3,
    title: 'Креативная концепция',
    description: 'Предлагаем подачу: визуальный язык, настроение, ритм, сценарный ход и главную мысль, которую зритель должен считать.',
    weDo: 'Собираем концепцию, референсы, moodboard, ключевой посыл и форматную логику будущего ролика.',
    clientDoes: 'Выбрать направление, дать комментарии по настроению, стилю и точности сообщения.',
    result: 'Утверждённая идея и визуальное направление',
    input: 'Бриф, референсы, ограничения бренда',
    artifacts: ['Moodboard', 'Креативный ход', 'Визуальный тон'],
    checks: ['есть главный hook', 'идея считывается быстро', 'подача подходит бренду'],
    tags: ['Concept', 'Moodboard', 'Tone', 'Hook'],
    visualType: 'concept',
  },
  {
    id: 4,
    title: 'Сценарий и съёмочный план',
    description: 'Переводим идею в структуру: сцены, кадры, текст, переходы, хронометраж, CTA и версии под разные площадки.',
    weDo: 'Готовим сценарную основу, shot list, порядок сцен, акценты продукта и план материалов на выходе.',
    clientDoes: 'Согласовать смысл, формулировки, важные детали продукта и юридически чувствительные моменты.',
    result: 'Сценарная структура и список кадров',
    input: 'Концепция, сообщение, нужные версии',
    artifacts: ['Сценарная логика', 'Shot list', 'Хронометраж'],
    checks: ['сцены работают на задачу', 'CTA на месте', 'понятны версии ролика'],
    tags: ['Script', 'Shot list', 'Timing', 'CTA'],
    visualType: 'storyboard',
  },
  {
    id: 5,
    title: 'Продакшен-подготовка',
    description: 'Собираем съёмочный день: локации, график, команда, техника, герои, реквизит, доступы и call sheet.',
    weDo: 'Организуем production: тайминг, crew, технику, логистику, список кадров и контрольные точки съёмочного дня.',
    clientDoes: 'Подтвердить дату, локацию, доступы, людей в кадре и контакт ответственного на площадке.',
    result: 'Готовый call sheet и понятный съёмочный день',
    input: 'Сценарий, локации, люди, доступы',
    artifacts: ['Call sheet', 'График съёмки', 'Список техники'],
    checks: ['команда собрана', 'локации подтверждены', 'тайминг реалистичен'],
    tags: ['Call sheet', 'Location', 'Crew', 'Gear'],
    visualType: 'preproduction',
  },
  {
    id: 6,
    title: 'Съёмка',
    description: 'Проводим production-день: режиссура, камера, свет, звук, работа с героями и контроль нужных кадров.',
    weDo: 'Ведём площадку, следим за кадрами, таймингом, качеством звука/света и соответствием сценарному плану.',
    clientDoes: 'Быть на связи для быстрых решений, помочь с доступами и подтвердить важные детали на месте.',
    result: 'Отснятый материал без хаоса на площадке',
    input: 'Call sheet, площадка, команда, герои',
    artifacts: ['Основные кадры', 'Детали продукта', 'Бэкап материала'],
    checks: ['кадры по списку сняты', 'звук и свет проверены', 'есть запасные дубли'],
    tags: ['REC', 'Camera', 'Light', 'Sound'],
    visualType: 'shooting',
  },
  {
    id: 7,
    title: 'Постпродакшен и пакет материалов',
    description: 'Монтируем, красим, чистим звук, добавляем графику и готовим версии под сайт, соцсети, рекламу, WhatsApp и презентации.',
    weDo: 'Собираем монтаж, цвет, звук, титры, графику, вертикальные/горизонтальные версии и экспорт под нужные площадки.',
    clientDoes: 'Дать правки в согласованные сроки и подтвердить финальные файлы перед передачей.',
    result: 'Готовый набор видео, который можно сразу использовать',
    input: 'Отснятый материал, сценарий, комментарии',
    artifacts: ['Main video', 'Short cuts', 'Версии под площадки'],
    checks: ['звук собран', 'цвет выровнен', 'экспорт готов к размещению'],
    tags: ['Edit', 'Color', 'Sound', 'Export'],
    visualType: 'postproduction',
  },
];

const workflowStats = [
  { value: '7', label: 'этапов без хаоса' },
  { value: '2+', label: 'версии под площадки' },
  { value: '1', label: 'понятный маршрут проекта' },
];

function AnchorNav({ compact = false }) {
  return (
    <nav className={compact ? 'anchor-nav anchor-nav--compact' : 'anchor-nav'} aria-label="Навигация по предложению">
      {navItems.map((item) => (
        <a key={item.href} href={item.href} onClick={_startAnchorScroll}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sticky-nav${visible ? ' sticky-nav--visible' : ''}`}
      aria-hidden={!visible}
    >
      <AnchorNav compact />
    </div>
  );
}

function MarketPainsSection() {
  const sectionRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePain = painScenes[activeIndex] ?? painScenes[0];
  const progress = `${((activeIndex + 1) / painScenes.length) * 100}%`;
  const questionWords = activePain.question.split(' ');
  const isLongQuestion = questionWords.length > 10;

  useEffect(() => {
    let frame = 0;

    const updateActiveQuestion = () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const nextStep = Math.min(Math.max(-rect.top / viewportHeight, 0), painScenes.length);
      const nextIndex = Math.min(painScenes.length - 1, Math.floor(nextStep));

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
        '--pains-scroll-height': `${painScenes.length * 100}svh`,
        '--pains-progress': progress,
        '--pains-accent': activePain.accent,
      }}
    >
      <div className="pains-sticky">
        <div className="pains-noise" aria-hidden="true" />
        <div className="pains-viewfinder" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pains-rec" aria-hidden="true">
          <i />
          Market scan
        </div>
        <header className="pains-heading">
          <p>02 / Проблемы рынка</p>
        </header>

        <div className="pain-stage" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.article
              className={isLongQuestion ? 'pain-question is-long' : 'pain-question'}
              variants={painItemVariants}
              custom={activeIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={activePain.id}
              aria-label={activePain.question}
            >
              <div className="pain-question__meta">
                <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                <em>{activePain.label}</em>
              </div>
              <h3 className="pain-question__text">
                {questionWords.map((word, index) => (
                  <motion.span
                    className="pain-question__word"
                    key={`${activePain.id}-${word}-${index}`}
                    initial={{ opacity: 0, y: 18, filter: 'blur(14px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.34,
                      delay: 0.04 + index * 0.028,
                      ease: [0.2, 0.8, 0.2, 1],
                    }}
                  >
                    {word}{index < questionWords.length - 1 ? '\u00a0' : ''}
                  </motion.span>
                ))}
              </h3>
              <div className="pain-question__signal" aria-hidden="true">
                <span>{activePain.signal}</span>
                <i />
              </div>
            </motion.article>
          </AnimatePresence>
        </div>

        <footer className="pains-footer">
          <div className="pains-progress" aria-hidden="true">
            <span />
          </div>
          <div className="pains-steps" aria-label={`Проблема ${activeIndex + 1} из ${painScenes.length}`}>
            {painScenes.map((scene, index) => (
              <span className={index === activeIndex ? 'is-active' : ''} key={scene.id} />
            ))}
          </div>
        </footer>
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

function isDirectVideoUrl(url) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);
}

function getDriveFileId(url) {
  return url?.match(/drive\.google\.com\/file\/d\/([^/]+)/i)?.[1] ?? null;
}

function normalizeVideoSource(video) {
  if (!video) return null;

  if (Array.isArray(video)) {
    return { playlist: video };
  }

  if (typeof video === 'string') {
    return {
      full: video,
      preview: video,
    };
  }

  return video;
}

function getPrimaryVideoSource(source) {
  if (!source) return null;

  if (source.full || source.src || source.preview) {
    return source;
  }

  return source.playlist?.[0] ?? source.videos?.[0] ?? null;
}

function getVideoList(video, fallbackPoster) {
  const source = normalizeVideoSource(video);
  const list = source?.playlist ?? source?.videos ?? (source ? [source] : []);

  return list.map((clip, index) => ({
    ...clip,
    label: clip.label ?? `Видео ${index + 1}`,
    poster: clip.poster ?? source?.poster ?? fallbackPoster,
  }));
}

function getPreviewMedia(video, fallbackImage) {
  const normalizedSource = normalizeVideoSource(video);
  const source = getPrimaryVideoSource(normalizedSource);
  const poster = source?.thumbnail ?? normalizedSource?.thumbnail ?? source?.poster ?? normalizedSource?.poster ?? fallbackImage;
  const preview = source?.preview ?? (source?.provider === 'drive' ? null : source?.src ?? source?.full);

  if (preview && isDirectVideoUrl(preview)) {
    return {
      type: 'video',
      src: preview,
      poster,
    };
  }

  if (poster) {
    return {
      type: 'image',
      src: poster,
    };
  }

  return null;
}

function getPlayableVideo(video, fallbackPoster) {
  const source = getPrimaryVideoSource(normalizeVideoSource(video));
  const src = source?.full ?? source?.src ?? source?.preview;

  if (!src) return null;

  const fileId = source?.fileId ?? getDriveFileId(src);
  const isDrive = source?.provider === 'drive' || Boolean(fileId);

  return {
    src,
    poster: source?.poster ?? fallbackPoster,
    provider: isDrive ? 'drive' : source?.provider,
    external: source?.external ?? (fileId ? driveView(fileId) : src),
    thumbnail: source?.thumbnail ?? (fileId ? driveThumbnail(fileId) : null),
  };
}

function getProjectMedia(item) {
  return getPreviewMedia(item.media, item.image) ?? {
    type: 'image',
    src: item.image,
  };
}

function ProjectMedia({ item, mode = 'preview', loading = 'lazy', draggable = false }) {
  const [imgError, setImgError] = useState(false);
  const media = getProjectMedia(item);
  const isPlayer = mode === 'player';

  if (!media) return null;

  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        poster={media.poster}
        muted={!isPlayer}
        loop={!isPlayer}
        autoPlay={!isPlayer}
        playsInline
        controls={isPlayer}
        preload={isPlayer ? 'auto' : 'metadata'}
      />
    );
  }

  if (imgError) return null;

  return <img src={media.src} alt="" loading={loading} draggable={draggable} onError={() => setImgError(true)} />;
}

function DriveVideoPlayer({ video, title }) {
  const externalUrl = video.external ?? video.src;

  // Drive returns HTTP 200 even for "access denied" pages — onError never fires,
  // so we can't reliably detect failure. Always show the external link so the
  // user can watch even when the embed is blocked.
  return (
    <div className="drive-player">
      <iframe
        key={video.src}
        src={video.src}
        title={title}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        className="drive-player__bar"
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Открыть в Google Drive
      </a>
    </div>
  );
}

function VideoModal({ item, onClose }) {
  const videoRef = useRef(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    setActiveVideoIndex(0);
  }, [item?.id]);

  const videos = getVideoList(item?.media, item?.image);
  const activeClip = videos[activeVideoIndex] ?? videos[0] ?? item?.media;
  const video = getPlayableVideo(activeClip, item?.image);

  return (
    <AnimatePresence>
      <motion.div
        className="video-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
      >
        <motion.div
          className="video-modal-box"
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="video-modal-close"
            onClick={onClose}
            aria-label="Закрыть"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="video-modal-meta">
            <span className="video-modal-category">{item.category}</span>
            <strong className="video-modal-title">{item.title}</strong>
          </div>
          <div className="video-modal-player">
            {video ? (
              video.provider === 'drive' ? (
                <DriveVideoPlayer video={video} title={item.title} />
              ) : (
                <video
                  key={video.src}
                  ref={videoRef}
                  src={video.src}
                  poster={video.poster}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                />
              )
            ) : (
              <div className="video-modal-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
                </svg>
                <p>Видео появится позже</p>
                <span>{item.description}</span>
              </div>
            )}
          </div>
          {videos.length > 1 && (
            <div className="video-modal-playlist" role="tablist" aria-label="Выбор ролика">
              {videos.map((clip, index) => (
                <button
                  key={`${clip.full ?? clip.src ?? clip.label}-${index}`}
                  type="button"
                  className={index === activeVideoIndex ? 'is-active' : ''}
                  onClick={() => setActiveVideoIndex(index)}
                  role="tab"
                  aria-selected={index === activeVideoIndex}
                >
                  {clip.label}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
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
      // Если активная — останавливаем propagation на mousedown/pointerdown
      // чтобы stage не начинал drag при клике на активную карточку
      onPointerDown={(e) => { if (isActive) e.stopPropagation(); }}
      onPointerUp={(e) => {
        if (isActive) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onMouseDown={(e) => { if (isActive) e.stopPropagation(); }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      aria-pressed={isActive}
      aria-label={`${item.title}. ${item.category}${isActive ? ' — нажмите для просмотра' : ''}`}
      initial={false}
      animate={{ opacity: isDimmed ? 0.24 : 1 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
    >
      <ProjectMedia item={item} draggable={false} />
      <span className="portfolio-card__shade" />
      {isActive && (
        <span className="portfolio-card__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ pointerEvents: 'none' }}>
            <circle cx="12" cy="12" r="12" fillOpacity="0.55" />
            <path d="M10 8l6 4-6 4V8z" />
          </svg>
        </span>
      )}
      <span className="portfolio-card__meta" style={{ pointerEvents: 'none' }}>
        <span>{item.category}</span>
        <strong>{item.title}</strong>
        <small>{item.serviceType}</small>
      </span>
    </motion.button>
  );
}

function PortfolioSphere({ activeService, activeItem, onSelectItem, onOpenVideo }) {
  const isMobile = useIsMobile();
  const stageRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0, rotation: { x: -0.16, y: 0.34 } });
  const dragMoved = useRef(false);
  const isDraggingRef = useRef(false);
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
      if (!isHovering && !isDraggingRef.current && now - lastInteraction.current > 3600) {
        setRotation((cur) => ({ x: cur.x, y: cur.y + delta * 0.00013 }));
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [isHovering]);

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
      const opacity = 1; // все карточки непрозрачные
      const rotateY = isActive ? 0 : point.x * -24;
      const rotateX = isActive ? 0 : point.y * 14;
      return {
        item, isActive,
        isDimmed: serviceHasMatches && !matchesService,
        style: {
          '--card-x': `${screenX}px`, '--card-y': `${screenY}px`,
          '--card-z': `${Math.round(point.z * 120)}px`, '--card-scale': scale,
          '--card-opacity': opacity, '--card-rotate-x': `${rotateX}deg`,
          '--card-rotate-y': `${rotateY}deg`,
          zIndex: isActive ? 80 : Math.round(depth * 60),
        },
      };
    });
  }, [activeItem.id, isMobile, relatedIds, rotation, serviceHasMatches]);

  const markInteraction = () => { lastInteraction.current = performance.now(); };

  const handleCardClick = (item, isActive) => {
    markInteraction();
    if (isActive) {
      // Активная карточка — всегда открываем видео
      // (drag уже заблокирован через stopPropagation в PortfolioCard)
      onOpenVideo(item);
    } else {
      // Неактивная — только если не было drag
      if (dragMoved.current) return;
      onSelectItem(item);
    }
  };

  const handlePointerDown = (e) => {
    if (isMobile) return;
    isDraggingRef.current = true;
    dragMoved.current = false;
    setIsDragging(true);
    markInteraction();
    dragStart.current = { x: e.clientX, y: e.clientY, rotation };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || isMobile) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved.current = true;
    const nextRotation = {
      x: Math.max(-0.72, Math.min(0.72, dragStart.current.rotation.x - dy * 0.006)),
      y: dragStart.current.rotation.y + dx * 0.008,
    };
    const frontItem = getFrontPortfolioItem(nextRotation);
    setRotation(nextRotation);
    if (frontItem.id !== activeItem.id) onSelectItem(frontItem);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    markInteraction();
    requestAnimationFrame(() => { dragMoved.current = false; });
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
              onClick={() => handleCardClick(item, item.id === activeItem.id)}
            >
              <ProjectMedia item={item} />
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
      onPointerLeave={() => { setIsHovering(false); handlePointerUp(); }}
    >
      <div className="portfolio-orbits" aria-hidden="true">
        <span /><span /><span />
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
            onSelect={() => handleCardClick(item, isActive)}
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
  const [videoItem, setVideoItem] = useState(null);
  const activeService = hoveredService ?? selectedService;
  const activeItem = portfolioItems.find((item) => item.id === activeItemId) ?? portfolioItems[0];
  const activeVideoCount = getVideoList(activeItem.media, activeItem.image).length;

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
          onOpenVideo={setVideoItem}
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
          <p className="eyebrow">Наши решения</p>
          <h2 id="offer-title">Решения под задачу</h2>
          <p>
            Закрываем не только съёмку, но и задачу: продвижение, продажи, соцсети, имидж
            и регулярный контент.
          </p>
        </motion.div>

        <ServicesList
          activeService={activeService}
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
          onServicePreview={setHoveredService}
          onServicePreviewEnd={() => setHoveredService(null)}
        />

        <button
          type="button"
          className="offer-video-cta"
          onClick={() => setVideoItem(activeItem)}
        >
          <span>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M9 7.5v9l7-4.5-7-4.5z" />
            </svg>
            Смотреть ролики
          </span>
          <em>{activeVideoCount} видео</em>
        </button>
      </div>
      {videoItem && <VideoModal item={videoItem} onClose={() => setVideoItem(null)} />}
    </section>
  );
}

function ComparisonRow({ item, index, isActive, onActivate }) {
  return (
    <motion.article
      className={isActive ? 'comparison-row is-active' : 'comparison-row'}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.42 }}
      onViewportEnter={() => onActivate(index)}
      onPointerEnter={() => onActivate(index)}
      onClick={() => onActivate(index)}
      tabIndex={0}
      aria-label={`${item.ordinary} → ${item.chudo}`}
    >
      {/* Левая карточка — обычная съёмка */}
      <motion.div
        className="comparison-card comparison-card--ordinary"
        variants={{
          hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
          visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] } },
        }}
      >
        <span className="comparison-card__label">Обычная съёмка</span>
        <strong>{item.ordinary}</strong>
      </motion.div>

      {/* Стрелка-трансформ */}
      <motion.div
        className="comparison-transform"
        variants={{
          hidden: { opacity: 0, scaleX: 0.5 },
          visible: { opacity: 1, scaleX: 1, transition: { duration: 0.38, delay: 0.18, ease: 'easeOut' } },
        }}
        aria-hidden="true"
      >
        <span className="comparison-transform__icon">{item.icon}</span>
        <i />
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      {/* Правая карточка — подход ChuDo */}
      <motion.div
        className="comparison-card comparison-card--chudo"
        variants={{
          hidden: { opacity: 0, y: 24, x: -10, filter: 'blur(10px)' },
          visible: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)', transition: { duration: 0.58, delay: 0.26, ease: [0.2, 0.8, 0.2, 1] } },
        }}
      >
        <span className="comparison-card__label comparison-card__label--chudo">Подход ChuDo</span>
        <strong>{item.chudo}</strong>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              className="comparison-card__detail"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
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
        <p className="eyebrow">Наш подход</p>
        <h2 id="usp-title">Не просто съёмка.<br />Продакшен под задачу бизнеса.</h2>
        <p>
          Мы не начинаем с вопроса «что снять?». Мы начинаем с вопроса:
          какую задачу должно решить видео после публикации?
        </p>
      </motion.header>

      <div className="comparison-board">
        {comparisonItems.map((item, index) => (
          <ComparisonRow
            item={item}
            index={index}
            isActive={activeIndex === index}
            onActivate={setActiveIndex}
            key={item.chudo}
          />
        ))}
      </div>
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
  const videoRef = useRef(null);
  const [thumbError, setThumbError] = useState(false);
  const previewMedia = getPreviewMedia(item.video, item.image);
  const videoCount = getVideoList(item.videos ?? item.video, item.image).length;

  return (
    <motion.button
      type="button"
      className="case-card"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => { if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}
      aria-label={`Смотреть кейс ${item.title}`}
    >
      {/* Превью */}
      <div className="case-card__thumb">
        {previewMedia?.type === 'video' ? (
          <video
            ref={videoRef}
            src={previewMedia.src}
            poster={previewMedia.poster}
            muted
            loop
            playsInline
            preload="metadata"
          />
        ) : previewMedia?.type === 'image' && !thumbError ? (
          <img src={previewMedia.src} alt="" loading="lazy" draggable={false} onError={() => setThumbError(true)} />
        ) : (
          <div className="case-card__thumb-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
            </svg>
          </div>
        )}
        <div className="case-card__thumb-overlay">
          <svg className="case-card__play-icon" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="12" fillOpacity="0.5"/>
            <path d="M10 8l6 4-6 4V8z"/>
          </svg>
        </div>
      </div>

      {/* Контент */}
      <div className="case-card__body">
        <div className="case-card__header">
          <span className="case-card__category">{item.category}</span>
          <span className="case-card__type">{item.type}</span>
        </div>
        <strong className="case-card__title">{item.title}</strong>
        <div className="case-card__tags">
          {item.formats.slice(0, 3).map((f) => <em key={f}>{f}</em>)}
        </div>
        {videoCount > 1 && <span className="case-card__count">{videoCount} видео</span>}
      </div>

      {/* Стрелка */}
      <div className="case-card__arrow">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 10h12M12 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.button>
  );
}

function CaseModal({ item, onClose }) {
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videos = getVideoList(item.videos ?? item.video, item.image);
  const activeClip = videos[activeVideoIndex] ?? videos[0] ?? item.video;
  const video = getPlayableVideo(activeClip, item.image);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  useEffect(() => {
    setActiveVideoIndex(0);
  }, [item.id]);

  return (
    <motion.div
      className="case-modal-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
      style={{ cursor: 'auto' }}
    >
      <button type="button" className="case-modal__close" onClick={onClose} aria-label="Закрыть">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <motion.article
        className="case-modal"
        role="dialog" aria-modal="true"
        aria-labelledby={`case-modal-title-${item.id}`}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Видеоплеер */}
        <div className="case-modal__media">
          {video ? (
            video.provider === 'drive' ? (
              <DriveVideoPlayer video={video} title={item.title} />
            ) : (
              <video key={video.src} src={video.src} poster={video.poster} controls autoPlay playsInline preload="auto" />
            )
          ) : (
            <div className="case-modal__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none"/>
              </svg>
              <p>Видео появится позже</p>
            </div>
          )}
        </div>
        {videos.length > 1 && (
          <div className="case-modal__playlist" role="tablist" aria-label="Выбор ролика">
            {videos.map((clip, index) => (
              <button
                key={`${clip.full ?? clip.src ?? clip.label}-${index}`}
                type="button"
                className={index === activeVideoIndex ? 'is-active' : ''}
                onClick={() => setActiveVideoIndex(index)}
                role="tab"
                aria-selected={index === activeVideoIndex}
              >
                {clip.label}
              </button>
            ))}
          </div>
        )}

        <div className="case-modal__body">
          <p className="case-modal__kicker">{item.category} · {item.type}</p>
          <h3 id={`case-modal-title-${item.id}`}>{item.title}</h3>
          <div className="case-modal__section"><span>Задача</span><p>{item.task}</p></div>
          <div className="case-modal__section"><span>Решение</span><p>{item.solution}</p></div>
          <div className="case-modal__section">
            <span>Форматы</span>
            <div className="case-modal__formats">
              {item.formats.map((f) => <em key={f}>{f}</em>)}
            </div>
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
  const [selectedCase, setSelectedCase] = useState(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'Все') return cases;
    return cases.filter((c) => c.category === activeFilter || c.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <section id="cases" className="cases-section" aria-labelledby="cases-title">
      <div className="cases-grain" aria-hidden="true" />

      <motion.header
        className="cases-heading"
        initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="cases-heading__text">
          <p className="eyebrow">Наши работы</p>
          <h2 id="cases-title">Проекты, которые мы сделали</h2>
        </div>
        {/* Фильтры */}
        <div className="case-filters" role="group" aria-label="Фильтр по категории">
          {caseFilters.map((f) => (
            <button
              key={f}
              type="button"
              className={f === activeFilter ? 'case-filter is-active' : 'case-filter'}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Список кейсов */}
      <div className="cases-list">
        <AnimatePresence mode="wait">
          {filtered.map((item, index) => (
            <CaseCard key={item.id} item={item} index={index} onSelect={setSelectedCase} />
          ))}
        </AnimatePresence>
      </div>

      {/* Модал */}
      <AnimatePresence>
        {selectedCase && <CaseModal item={selectedCase} onClose={() => setSelectedCase(null)} />}
      </AnimatePresence>
    </section>
  );
}

function WorkflowDossier({ step }) {
  const artifacts = step.artifacts ?? [];
  const checks = step.checks ?? [];

  return (
    <div className="workflow-dossier">
      <div className="workflow-dossier__top">
        <span>Stage {String(step.id).padStart(2, '0')}</span>
        <strong>{step.title}</strong>
        <p>{step.result}</p>
      </div>

      <div className="workflow-dossier__flow" aria-label="Вход и выход этапа">
        <div>
          <span>Вход</span>
          <strong>{step.input}</strong>
        </div>
        <i aria-hidden="true" />
        <div>
          <span>Выход</span>
          <strong>{step.result}</strong>
        </div>
      </div>

      <div className="workflow-dossier__columns">
        <div className="workflow-dossier__column">
          <span>Артефакты</span>
          {artifacts.map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>
        <div className="workflow-dossier__column workflow-dossier__column--checks">
          <span>Контроль</span>
          {checks.map((item) => (
            <em key={item}>{item}</em>
          ))}
        </div>
      </div>
    </div>
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
      <div className="workflow-visual__inner">
        {!compact && renderVisual()}
        <WorkflowDossier step={step} />
      </div>
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
      <span className="workflow-step__result">{step.result}</span>
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
        if (_anchorScrollActive) return;

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
        <p className="eyebrow">Как мы работаем</p>
        <h2 id="workflow-title">От задачи до готового видеопродукта</h2>
        <div className="workflow-heading__side">
          <p>
            Мы заранее выстраиваем процесс: понимаем задачу, формулируем идею, готовим съёмку,
            производим материал и передаём версии под нужные площадки.
          </p>
          <div className="workflow-stats" aria-label="Ключевые параметры процесса">
            {workflowStats.map((item) => (
              <span key={item.label}>
                <strong>{item.value}</strong>
                <em>{item.label}</em>
              </span>
            ))}
          </div>
        </div>
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

    </section>
  );
}

function CinemaCameraModel() {
  const rig = useRef(null);
  const gltf = useLoader(GLTFLoader, cameraModelUrl);

  const { scene, scale } = useMemo(() => {
    const clonedScene = gltf.scene.clone(true);

    clonedScene.traverse((object) => {
      if (!object.isMesh) return;

      // Скрываем стол — плоский широкий меш
      const box = new THREE.Box3().setFromObject(object);
      const sz = new THREE.Vector3();
      box.getSize(sz);
      if (sz.x > sz.y * 3 || sz.z > sz.y * 3) {
        object.visible = false;
        return;
      }

      object.castShadow = true;
      object.receiveShadow = false;

      if (object.material) {
        object.material = object.material.clone();
        object.material.roughness   = Math.min(object.material.roughness  ?? 0.3,  0.28);
        object.material.metalness   = Math.max(object.material.metalness  ?? 0.6,  0.55);
        object.material.envMapIntensity = 1.4;
        if (object.material.color) object.material.color.multiplyScalar(1.35);
        object.material.needsUpdate = true;
      }
    });

    const box    = new THREE.Box3().setFromObject(clonedScene);
    const size   = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    clonedScene.position.set(-center.x, -center.y, -center.z);

    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    return { scene: clonedScene, scale: 5.6 / maxDimension };
  }, [gltf]);

  return (
    <group ref={rig} scale={scale}>
      <primitive object={scene} />
    </group>
  );
}

// Авто-вращение + полный OrbitControls при взаимодействии
function SmartControls({ isInteracting }) {
  const { camera, gl } = useThree();
  const controls = useRef(null);
  const autoAngle = useRef(0);

  useEffect(() => {
    const c = new OrbitControlsImpl(camera, gl.domElement);
    c.enableDamping   = true;
    c.dampingFactor   = 0.07;
    c.enablePan       = false;
    c.enableZoom      = true;
    c.enableRotate    = true;
    c.minDistance     = 2.5;
    c.maxDistance     = 12;
    c.rotateSpeed     = 0.85;
    c.zoomSpeed       = 0.9;
    // Без ограничений по вертикали — полный 360°
    c.minPolarAngle   = 0;
    c.maxPolarAngle   = Math.PI;
    c.target.set(0, 0, 0);
    c.update();
    controls.current = c;
    return () => { c.dispose(); controls.current = null; };
  }, [camera, gl]);

  useFrame((_, delta) => {
    if (!controls.current) return;

    if (isInteracting.current) {
      // Пользователь взаимодействует — обычный OrbitControls
      controls.current.autoRotate = false;
      controls.current.update();
    } else {
      // Idle — медленное авто-вращение по орбите
      controls.current.autoRotate      = true;
      controls.current.autoRotateSpeed = 1.2;
      controls.current.update();
    }
  });

  return null;
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

function CameraScene({ isInteracting }) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0.5, 6.2], fov: 30 }}
      dpr={[1, 1.7]}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.65;
      }}
    >
      <hemisphereLight args={['#ffffff', '#1a0a05', 1.4]} />
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 6, 6]}   intensity={5.5} color="#f5f8ff" />
      <directionalLight position={[-3, 4, 2]}  intensity={2.8} color="#ffffff" />
      <spotLight       position={[-4.6, 3.2, 4.2]} intensity={4.5} angle={0.45} penumbra={0.6} color="#ff6a2a" />
      <pointLight      position={[2.6, 1.2, 3.2]}  intensity={4.0} color="#86b5ff" />
      <pointLight      position={[-2.8, 1.5, 2.6]} intensity={3.2} color="#ffffff" />
      <pointLight      position={[0, -1, 2]}        intensity={1.8} color="#ffcfb0" />
      <Suspense fallback={<CameraLoadingFallback />}>
        <CinemaCameraModel />
      </Suspense>
      <SmartControls isInteracting={isInteracting} />
    </Canvas>
  );
}

function HeroVisual() {
  const isInteracting = useRef(false);
  const idleTimer     = useRef(null);

  // Сброс в idle через 2 сек после последнего действия
  const resetIdle = () => {
    isInteracting.current = true;
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      isInteracting.current = false;
    }, 2000);
  };

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  return (
    <div
      className="hero-visual"
      aria-label="3D-камера RED. Вращайте и приближайте мышью. Без действий — медленно вращается сама."
      onMouseDown={resetIdle}
      onMouseMove={(e) => { if (e.buttons > 0) resetIdle(); }}
      onWheel={resetIdle}
      onTouchStart={resetIdle}
      onTouchMove={resetIdle}
    >
      <motion.div
        className="camera-stage"
        data-cursor="camera"
        initial={{ opacity: 0, scale: 0.88, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div className="camera-canvas">
          <CameraScene isInteracting={isInteracting} />
        </div>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <main className="site-shell">
      <CustomCursor />
      <StickyNav />
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
            <p className="eyebrow">ChuDo Production · Бишкек · 2026</p>
            <h1 id="hero-title">
              <BlurText text="Видео," delay={180} stepDelay={55} />{' '}
              <span><BlurText text="которое продаёт" delay={360} stepDelay={50} /></span>{' '}
              <BlurText text="за вас." delay={620} stepDelay={50} />
            </h1>
            <p className="lead">
              Рекламные ролики, имиджевые фильмы и контент для соцсетей —
              снимаем так, чтобы клиент понял ценность продукта с первого просмотра.
            </p>
            <div className="hero-actions">
              <a
                className="button button--whatsapp button--shimmer"
                href="https://wa.me/996500669763"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в WhatsApp"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.082a.75.75 0 0 0 .921.921l5.224-1.476A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.712 9.712 0 0 1-4.953-1.357l-.355-.211-3.676 1.039 1.04-3.594-.23-.37A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
                WhatsApp
              </a>
              <a
                className="button button--telegram button--shimmer"
                href="https://t.me/+996500669763"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в Telegram"
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                Telegram
              </a>
              <a className="button button--ghost" href="#cases" onClick={_startAnchorScroll}>
                Смотреть работы
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
      <PartnersSection />
      <ContactSection />
    </main>
  );
}

export default App;
