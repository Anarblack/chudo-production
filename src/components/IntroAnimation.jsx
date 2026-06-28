import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';

// ── Path data ────────────────────────────────────────────────────────
const ARCHAR_PATH = 'M17155 12995 c-22 -8 -51 -14 -65 -13 -14 0 -36 -4 -51 -10 -15 -6 -31 -6 -41 -1 -9 5 -34 1 -69 -11 -29 -11 -65 -20 -79 -19 -14 0 -58 -12 -99 -26 -40 -14 -79 -24 -87 -21 -7 3 -16 -3 -19 -14 -3 -10 -20 -27 -38 -38 -48 -28 -237 -203 -237 -220 0 -4 -13 -21 -28 -38 -58 -67 -112 -150 -112 -174 0 -11 -9 -29 -20 -40 -11 -11 -20 -23 -20 -27 0 -21 -61 -167 -72 -174 -7 -5 -14 -21 -15 -36 -6 -123 -18 -196 -32 -201 -6 -2 -9 -7 -6 -11 7 -12 9 -220 2 -227 -3 -4 1 -23 9 -43 8 -20 14 -36 13 -36 0 0 4 -20 11 -44 6 -23 9 -49 6 -56 -2 -7 4 -23 15 -36 10 -12 19 -28 19 -36 0 -8 11 -31 25 -51 14 -20 25 -45 25 -54 0 -10 4 -18 9 -18 5 0 14 -15 22 -32 7 -18 16 -35 19 -38 4 -3 23 -26 42 -51 37 -50 44 -58 83 -102 14 -16 22 -33 19 -39 -4 -6 -2 -8 4 -5 10 7 28 -6 97 -68 18 -17 65 -48 104 -69 39 -22 71 -43 71 -48 0 -4 11 -8 25 -8 15 0 39 -7 54 -15 31 -16 53 -21 156 -39 39 -7 79 -17 90 -23 29 -14 107 -16 115 -2 5 6 43 18 86 25 44 7 95 16 114 19 19 4 51 15 71 25 20 11 39 17 43 13 3 -3 6 -1 6 5 0 6 12 18 28 26 26 14 82 65 111 100 7 10 30 57 50 104 35 83 37 93 40 207 1 65 3 121 6 123 2 2 -5 12 -16 23 -10 10 -19 31 -19 45 0 14 -14 53 -30 86 -17 34 -28 63 -26 66 3 2 1 9 -5 16 -49 59 -50 61 -56 47 -3 -7 -13 -20 -23 -29 -10 -8 -16 -21 -13 -28 7 -18 -100 -227 -138 -269 -77 -85 -147 -145 -183 -158 -100 -37 -156 -49 -188 -43 -18 4 -48 9 -67 11 -18 1 -38 8 -44 14 -6 6 -19 11 -28 11 -26 0 -129 81 -135 107 -4 13 -12 23 -20 23 -22 0 -78 60 -109 115 -15 28 -39 66 -52 87 -14 20 -26 42 -27 50 -1 7 -8 30 -15 51 -7 21 -10 44 -7 52 3 8 -1 18 -8 22 -29 17 -34 46 -19 107 14 52 13 63 0 97 -14 36 -14 41 4 76 11 21 24 56 30 78 20 73 147 244 187 249 8 2 16 10 18 20 4 27 42 55 66 48 14 -3 19 -1 14 6 -7 12 29 48 74 72 74 40 178 90 185 90 5 0 28 9 52 21 24 12 62 23 86 27 23 3 52 12 65 20 14 9 57 17 110 20 79 4 122 4 288 3 53 0 104 -15 115 -33 4 -6 22 -11 40 -10 34 1 69 -13 81 -32 4 -6 13 -11 20 -12 7 0 20 -2 29 -2 19 -2 142 -84 188 -126 67 -62 72 -68 67 -82 -3 -9 -1 -12 4 -9 12 8 53 -33 95 -96 17 -24 34 -46 38 -47 4 -2 21 -29 38 -60 16 -32 36 -68 44 -82 39 -73 65 -129 65 -144 0 -9 4 -16 9 -16 11 0 41 -85 41 -115 0 -11 9 -38 20 -60 11 -22 20 -45 20 -52 0 -7 11 -46 25 -87 18 -53 24 -90 21 -126 -2 -27 0 -50 4 -50 14 0 20 -31 10 -51 -6 -11 -7 -19 -1 -19 15 0 20 -26 11 -64 -6 -29 -5 -38 8 -45 15 -8 16 -30 13 -183 -1 -95 -7 -181 -12 -190 -5 -10 -7 -32 -4 -49 6 -31 -10 -99 -23 -99 -4 0 -7 -19 -7 -42 -1 -53 -79 -213 -133 -272 -115 -124 -225 -208 -251 -191 -5 3 -12 -4 -16 -15 -3 -11 -18 -23 -33 -26 -15 -3 -45 -15 -68 -25 -22 -10 -49 -19 -60 -19 -10 -1 -37 -7 -58 -15 -26 -9 -45 -11 -57 -5 -12 7 -19 6 -22 -3 -2 -7 -23 -13 -48 -14 -24 -1 -84 -5 -132 -9 -58 -4 -97 -2 -116 6 -32 13 -73 15 -148 6 -36 -5 -55 -3 -65 7 -7 7 -31 14 -53 14 -52 1 -176 9 -240 17 -27 3 -63 5 -80 5 -16 0 -39 0 -50 0 -11 0 -51 7 -90 16 -55 13 -97 16 -192 11 -97 -4 -125 -3 -136 8 -8 9 -19 11 -27 6 -8 -5 -19 -6 -24 -2 -6 3 -24 5 -40 4 -16 -2 -39 4 -52 13 -13 8 -33 14 -46 13 -26 -2 -148 41 -148 52 0 4 -18 12 -40 19 -21 6 -45 17 -52 24 -7 8 -43 30 -81 51 -67 38 -101 71 -91 88 3 5 0 9 -7 7 -32 -4 -41 2 -110 66 -14 13 -48 41 -75 61 -27 20 -59 47 -71 58 -71 69 -126 92 -172 71 -78 -35 -131 -118 -158 -245 -8 -36 -15 -72 -17 -80 -2 -8 -6 -27 -10 -42 -12 -41 -13 -447 -1 -451 5 -2 11 -46 12 -98 2 -52 5 -128 6 -169 2 -41 -1 -85 -6 -96 -7 -16 -4 -29 8 -48 15 -22 17 -41 12 -103 -3 -43 -1 -85 4 -95 14 -25 27 -124 34 -254 1 -34 6 -71 10 -84 10 -32 16 -71 15 -102 0 -16 4 -28 8 -28 20 0 30 -46 16 -72 -12 -23 -11 -28 7 -49 13 -15 18 -30 14 -44 -10 -30 -8 -57 5 -65 6 -4 27 -37 45 -74 61 -117 58 -116 240 -88 36 5 67 6 78 0 12 -6 23 -3 39 12 13 11 33 23 45 26 12 3 29 16 37 28 13 21 12 25 -15 52 -16 16 -42 42 -57 58 -15 16 -41 43 -57 60 -36 36 -87 121 -78 129 3 3 -8 20 -25 37 -17 16 -36 47 -43 67 -6 21 -16 41 -21 44 -29 19 -45 328 -24 444 4 17 8 40 10 53 2 13 8 28 15 35 6 6 11 19 11 29 0 26 48 118 64 124 8 3 19 18 26 34 13 32 82 98 144 139 23 14 46 32 51 39 12 15 92 35 106 27 5 -4 16 1 25 9 10 11 21 13 31 8 9 -5 30 -4 52 3 51 17 231 7 272 -16 13 -6 47 -13 77 -15 29 -3 61 -8 71 -13 9 -5 46 -13 80 -17 37 -4 71 -14 80 -23 11 -11 40 -17 86 -20 43 -2 92 -12 127 -26 31 -13 59 -21 61 -18 9 8 87 -17 87 -29 0 -6 9 -8 21 -5 28 8 77 -11 90 -35 6 -10 16 -17 22 -15 26 9 194 -78 217 -113 3 -4 19 -14 35 -23 17 -9 41 -27 55 -41 50 -52 112 -106 121 -106 3 0 10 -9 15 -19 5 -10 28 -41 51 -67 97 -113 169 -236 157 -268 -3 -8 4 -16 18 -19 15 -4 30 -21 42 -47 9 -22 23 -46 29 -53 7 -6 20 -24 29 -39 56 -86 180 -202 245 -229 l53 -21 64 32 c104 54 118 100 56 191 -16 24 -30 50 -30 57 0 6 -4 12 -10 12 -12 0 -49 71 -43 86 2 6 -8 16 -21 22 -30 13 -85 125 -93 187 -14 112 -14 213 -1 226 8 8 13 33 13 59 -1 50 24 131 49 155 9 9 16 25 16 35 0 10 7 26 16 34 8 9 17 24 19 35 5 26 34 81 43 81 4 1 22 25 41 54 19 29 50 61 69 72 24 13 36 27 37 43 1 13 10 28 19 33 10 5 33 25 53 44 19 19 41 34 48 34 7 0 15 6 18 14 6 16 223 126 248 126 9 0 32 6 50 13 20 8 80 15 144 16 173 3 183 29 62 153 -190 195 -250 315 -249 498 1 112 7 162 27 235 9 33 18 80 21 105 3 25 12 56 20 68 16 24 15 77 0 172 -3 19 -7 55 -9 80 -1 25 -6 48 -11 51 -5 4 -10 17 -12 30 -2 13 -11 51 -19 84 -9 33 -18 68 -20 79 -2 10 -14 36 -25 58 -11 21 -20 44 -20 50 0 7 -16 43 -36 80 -22 44 -33 76 -29 89 4 12 1 21 -9 25 -8 3 -20 22 -27 41 -6 19 -20 44 -30 54 -11 11 -19 28 -19 39 0 11 -4 20 -9 20 -5 0 -12 8 -16 19 -3 10 -13 28 -23 39 -9 11 -24 30 -32 43 -26 38 -146 181 -198 235 -19 18 -37 34 -41 34 -8 0 -69 44 -101 72 -9 8 -34 24 -55 37 -22 13 -45 29 -50 35 -6 6 -30 20 -55 32 -25 11 -74 35 -110 52 -36 16 -96 40 -135 51 -38 12 -85 27 -104 33 -19 6 -48 11 -66 13 -17 1 -38 5 -45 10 -7 4 -23 10 -34 11 -12 2 -43 8 -71 14 -27 6 -61 8 -75 4 -28 -7 -157 -6 -235 1 -31 3 -65 -1 -90 -10z';

// Letters: visual order C(0), h(1), u(3), D(2), o(4)
const P_C = 'M6002 13062 c-36 -6 -94 -48 -405 -294 -199 -158 -504 -398 -677 -533 -2284 -1785 -3272 -2686 -3965 -3615 -202 -271 -306 -391 -536 -620 -213 -212 -267 -280 -326 -407 -128 -278 -102 -624 75 -979 417 -839 1325 -2336 1898 -3131 227 -315 559 -843 1279 -2033 707 -1168 974 -1436 1430 -1433 410 2 810 232 912 524 103 298 -77 814 -484 1384 -112 156 -194 255 -554 665 -152 173 -296 338 -320 365 -112 127 -660 740 -904 1009 -502 555 -547 611 -810 1021 -361 562 -575 1012 -683 1440 -97 381 -92 819 13 1140 164 503 487 833 1830 1875 187 145 459 357 605 470 317 246 879 681 1380 1068 201 155 399 308 440 340 41 32 222 171 401 310 238 183 330 260 342 284 59 128 180 387 238 511 l70 148 -37 44 c-115 141 -374 311 -578 379 -176 59 -482 92 -634 68z';
const P_H = 'M8998 13015 c-82 -17 -154 -47 -192 -83 -113 -106 -191 -594 -226 -1412 -5 -135 -12 -290 -16 -345 -3 -55 -9 -622 -15 -1260 -5 -638 -11 -1335 -14 -1550 -3 -214 -10 -748 -16 -1185 -5 -437 -12 -858 -15 -935 -23 -651 -61 -1185 -119 -1680 -46 -384 -66 -462 -249 -980 -108 -305 -140 -465 -140 -705 0 -187 2 -201 59 -554 50 -304 50 -482 0 -931 -74 -660 -20 -1024 183 -1245 100 -109 154 -135 282 -135 101 0 108 1 180 38 136 68 276 203 395 382 l54 80 50 550 c28 303 58 622 66 710 8 88 37 408 65 710 27 303 57 622 65 710 15 156 84 909 166 1825 23 250 46 461 52 468 32 41 399 179 762 287 50 15 117 35 150 45 468 146 1246 334 1385 335 114 0 234 -75 322 -203 164 -238 260 -1016 260 -2107 1 -487 1 -492 -31 -750 -33 -282 -92 -782 -115 -990 -16 -137 -40 -348 -106 -915 -113 -973 -120 -1031 -120 -1055 0 -19 16 -24 173 -54 94 -18 192 -37 217 -42 72 -16 736 -31 796 -19 106 22 121 57 139 325 10 149 26 279 60 501 152 970 210 1719 210 2684 0 1001 -73 1801 -235 2570 -161 767 -423 1131 -910 1266 -195 54 -718 39 -1467 -41 -355 -39 -393 -51 -715 -243 -207 -123 -280 -159 -395 -198 -80 -26 -236 -44 -245 -28 -3 5 0 317 7 694 7 377 16 836 19 1020 3 184 10 547 15 805 6 259 13 652 16 875 4 223 12 717 20 1098 11 579 11 703 0 756 -53 254 -140 381 -387 565 -137 102 -138 103 -138 220 0 53 -4 102 -8 109 -21 33 -170 42 -294 17z';
const P_D = 'M21045 13017 c-36 -17 -85 -71 -86 -95 -1 -38 2 -182 11 -432 5 -146 12 -355 15 -465 5 -179 13 -424 30 -890 3 -82 19 -541 35 -1020 17 -478 37 -1057 45 -1285 8 -228 17 -505 20 -615 5 -191 19 -583 30 -895 3 -80 28 -800 55 -1600 27 -800 54 -1594 60 -1765 6 -170 13 -375 16 -455 5 -153 99 -2918 109 -3224 7 -197 9 -204 61 -237 49 -30 126 -34 389 -20 1310 67 2555 522 3794 1384 229 159 333 252 796 706 299 294 513 490 587 541 64 43 109 55 278 75 253 29 277 54 488 475 126 250 181 369 409 870 14 30 75 168 135 305 60 138 115 264 123 280 7 17 39 91 70 165 32 74 70 164 85 200 44 101 149 365 187 470 104 286 240 907 268 1230 4 41 9 86 11 100 2 14 7 124 10 245 42 1405 -586 2398 -2106 3331 -439 270 -914 525 -1905 1022 -198 100 -436 221 -530 270 -494 257 -939 483 -1150 584 -229 109 -356 168 -360 168 -2 0 -79 33 -172 74 -684 299 -1660 571 -1808 503z m1482 -1738 c192 -61 468 -175 813 -337 367 -171 1606 -797 1955 -987 1311 -713 2032 -1219 2280 -1599 219 -336 310 -674 310 -1151 0 -592 -156 -1175 -506 -1890 -508 -1039 -1401 -2159 -2204 -2765 -692 -521 -1479 -909 -2233 -1101 -258 -66 -312 -70 -370 -32 -75 49 -84 84 -72 259 35 520 -10 1339 -115 2107 -8 59 -22 155 -30 215 -8 59 -37 271 -65 472 -28 201 -57 412 -65 470 -102 739 -142 1317 -152 2205 -7 621 15 1536 52 2165 2 47 9 175 15 285 11 198 32 553 70 1185 26 424 26 424 58 462 64 76 114 83 259 37z';
const P_U = 'M15767 8020 c-47 -12 -85 -32 -158 -81 -31 -21 -114 -66 -185 -100 -243 -114 -289 -143 -353 -215 -77 -88 -86 -139 -86 -484 0 -162 3 -335 7 -385 4 -49 19 -236 33 -415 42 -523 38 -730 -35 -1500 -54 -569 -61 -682 -67 -990 -10 -521 32 -904 147 -1335 134 -505 367 -989 635 -1320 551 -681 1197 -768 1837 -248 119 97 146 108 258 108 201 0 302 -105 335 -350 59 -431 124 -527 423 -616 191 -58 307 -74 537 -74 256 0 349 22 429 101 112 111 95 215 -174 1084 -117 378 -149 487 -194 650 -41 153 -95 507 -128 850 -26 279 -33 1258 -10 1575 7 94 15 204 17 245 13 204 29 416 65 860 84 1038 94 1190 94 1565 0 467 -46 730 -140 792 -41 27 -157 53 -234 53 -107 0 -139 -21 -210 -135 -46 -74 -67 -98 -120 -134 -378 -259 -438 -316 -491 -467 -50 -143 -104 -529 -154 -1099 -4 -50 -28 -413 -60 -935 -76 -1217 -194 -1774 -522 -2460 -180 -377 -243 -457 -388 -495 -178 -46 -339 58 -400 260 -209 684 -311 1580 -317 2765 l-3 515 44 180 c43 177 44 184 53 430 12 296 5 964 -12 1155 -29 333 -70 482 -155 564 -73 72 -218 111 -318 86z';
const P_O = 'M32100 7925 c-256 -52 -569 -214 -732 -378 -221 -223 -607 -736 -863 -1147 -709 -1135 -1062 -2180 -975 -2879 55 -433 681 -1695 1268 -2556 360 -528 656 -843 869 -926 121 -47 331 -27 542 51 575 212 1467 943 2215 1814 306 357 378 469 557 861 156 344 138 326 371 356 296 37 308 42 308 137 0 152 -131 745 -270 1222 -10 36 -40 139 -65 230 -81 287 -181 610 -259 840 -138 402 -533 898 -988 1237 -476 355 -1577 1104 -1676 1139 -47 17 -216 16 -302 -1z m107 -1481 c1347 -407 2059 -1383 1883 -2581 -137 -936 -783 -1793 -1704 -2264 l-86 -44 -82 28 c-117 41 -367 164 -473 234 -630 416 -944 1104 -922 2017 6 236 12 302 48 486 45 232 136 518 239 750 194 440 496 913 815 1275 34 39 74 85 90 103 36 40 47 40 192 -4z';

const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1];
const CUT_SRCS = [
  '/intro/cuts/cut-1.mp4',
  '/intro/cuts/cut-2.mp4',
  '/intro/cuts/cut-3.mp4',
  '/intro/cuts/cut-4.mp4',
];

const LETTER_TR = { duration: 0.22, ease: 'easeOut' };

export default function IntroAnimation({ onComplete }) {
  const [visible,    setVisible]    = useState(true);
  const [activeCut,  setActiveCut]  = useState(-1);
  const [flashWhite, setFlashWhite] = useState(false);
  const [showArchar, setShowArchar] = useState(false);
  const [showLogo,   setShowLogo]   = useState(false);
  const [letters,    setLetters]    = useState([false,false,false,false,false]);

  const completedRef = useRef(false);
  const audioRef     = useRef(null);
  const blurRef      = useRef(null);
  const videoRefs    = useRef([]);
  const logoRef      = useRef(null);
  const timersRef    = useRef([]);
  const timeStartRef = useRef(null);

  // Archar motion values
  const mArcharOp = useMotionValue(0);
  const mScale    = useMotionValue(1.4);
  const mGlowSD   = useMotionValue(80);
  const mRotate   = useMotionValue(0);

  // Overlay background (fades to transparent during fly)
  const mBg = useMotionValue('#000000');

  // Logo fly-to-header motion values
  const mLogoX     = useMotionValue(0);
  const mLogoY     = useMotionValue(0);
  const mLogoScale = useMotionValue(1);

  function t(ms, fn) {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }

  function handleComplete() {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach(clearTimeout);
    setVisible(false);
  }

  // Reduce motion: skip intro entirely
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
    }
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard: Esc = exit; Shift+R = reset+reload (DEV only)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { handleComplete(); return; }
      if (import.meta.env.DEV && e.shiftKey && e.key === 'R') {
        import('../lib/intro.js').then(m => { m.resetIntro(); location.reload(); });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Hard 5s failsafe: if timeline stalls, force complete
  useEffect(() => {
    const id = setTimeout(() => handleComplete(), 5000);
    return () => clearTimeout(id);
  }, []);

  // glow stdDeviation → DOM (no re-renders)
  useEffect(() => mGlowSD.on('change', v => {
    blurRef.current?.setAttribute('stdDeviation', v.toFixed(2));
  }), [mGlowSD]);

  function startTimeline() {
    timeStartRef.current = Date.now();
    const v = videoRefs.current;

    // ── Reel cuts ──────────────────────────────────────────────────
    t(100, () => {
      if (v[0]) { v[0].currentTime = 0; v[0].play().catch(() => {}); }
      setActiveCut(0);
    });
    t(300, () => { setFlashWhite(true); v[0]?.pause(); });
    t(350, () => {
      setFlashWhite(false);
      if (v[1]) { v[1].currentTime = 0; v[1].play().catch(() => {}); }
      setActiveCut(1);
    });
    t(650, () => { setFlashWhite(true); v[1]?.pause(); });
    t(700, () => {
      setFlashWhite(false);
      if (v[2]) { v[2].currentTime = 0; v[2].play().catch(() => {}); }
      setActiveCut(2);
    });
    t(1000, () => { setFlashWhite(true); v[2]?.pause(); });
    t(1050, () => {
      setFlashWhite(false);
      if (v[3]) { v[3].currentTime = 0; v[3].play().catch(() => {}); }
      setActiveCut(3);
    });

    // ── BIG FLASH → archar ─────────────────────────────────────────
    t(1350, () => {
      setFlashWhite(true);
      v[3]?.pause();
      setActiveCut(-1);
    });
    // Peak of flash (80ms in): archar appears at scale 1.4, glow 250, blur 0
    t(1430, () => {
      mArcharOp.set(1);
      mScale.set(1.4);
      mGlowSD.set(250);
      setShowArchar(true);
      setFlashWhite(false);      // white fades (40ms CSS transition)
    });
    // Flash spades: scale 1.4→1.0 (easeOutBack), glow 250→20, bg pulse
    t(1450, () => {
      animate(mScale, 1.0, { duration: 0.25, ease: EASE_OUT_BACK });
      animate(mGlowSD, 20, { duration: 0.3 });
      animate(mBg, ['#030405', '#3a1808', '#030405'], { duration: 0.35, times: [0, 0.3, 1] });
    });
    // Shake
    t(1700, () => {
      animate(mRotate, [-2, 2, 0], { duration: 0.15, times: [0, 0.5, 1] });
    });

    // ── Logo assembly ──────────────────────────────────────────────
    t(2050, () => {
      animate(mArcharOp, 0, { duration: 0.15 }); // archar standalone fades
      setShowLogo(true);                          // full logo SVG shown
    });
    // Letters stagger: C, h, u, D, o (visual left→right)
    t(2100, () => setLetters([true,  false, false, false, false]));
    t(2150, () => setLetters([true,  true,  false, false, false]));
    t(2200, () => setLetters([true,  true,  false, true,  false])); // u = index 3
    t(2250, () => setLetters([true,  true,  true,  true,  false])); // D = index 2
    t(2300, () => setLetters([true,  true,  true,  true,  true]));

    // ── Fly to header ──────────────────────────────────────────────
    t(3000, () => flyToHeader());

    // ── Complete ───────────────────────────────────────────────────
    t(3650, () => handleComplete());
  }

  function flyToHeader() {
    const logoEl  = logoRef.current;
    const target  = document.querySelector('.logo-link img');
    if (!logoEl || !target) {
      animate(mBg, 'rgba(0,0,0,0)', { duration: 0.5 });
      return;
    }
    const lR = logoEl.getBoundingClientRect();
    const tR = target.getBoundingClientRect();
    const dx    = (tR.x + tR.width / 2)  - (lR.x + lR.width / 2);
    const dy    = (tR.y + tR.height / 2) - (lR.y + lR.height / 2);
    const scale = tR.width / lR.width;
    const ease  = [0.65, 0, 0.35, 1];
    animate(mLogoX,     dx,    { duration: 0.55, ease });
    animate(mLogoY,     dy,    { duration: 0.55, ease });
    animate(mLogoScale, scale, { duration: 0.55, ease });
    animate(mBg, 'rgba(0,0,0,0)', { duration: 0.5, ease: 'easeIn' });
  }

  // Preload + audio
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const loads = videoRefs.current.map(v => {
        if (!v) return Promise.resolve();
        v.load();
        return new Promise(res => {
          if (v.readyState >= 3) { res(); return; }
          v.addEventListener('canplaythrough', res, { once: true });
          setTimeout(res, 3000);
        });
      });
      await Promise.all(loads);
      if (cancelled) return;

      startTimeline();

      // Silent autoplay attempt — blocked in most browsers without prior interaction
      audioRef.current?.play().catch(() => {});
    }
    init();
    return () => { cancelled = true; };
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          style={{ ...S.overlay, backgroundColor: mBg }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          <audio ref={audioRef} src="/intro/sting.mp3" preload="auto" />

          {/* ── Videos (always in DOM) ────────────────────────── */}
          {CUT_SRCS.map((src, i) => (
            <video
              key={i}
              ref={el => { videoRefs.current[i] = el; }}
              src={src}
              muted
              playsInline
              preload="auto"
              style={{ ...S.cutVideo, opacity: activeCut === i ? 1 : 0 }}
            />
          ))}

          {/* ── White flash ───────────────────────────────────── */}
          <motion.div
            style={S.flashDiv}
            animate={{ opacity: flashWhite ? 1 : 0 }}
            transition={{ duration: 0.04 }}
          />

          {/* ── Vignette ──────────────────────────────────────── */}
          <div style={S.vignette} />

          {/* ── Phase 1: Standalone archar ────────────────────── */}
          {showArchar && (
            <div style={S.logoOuter}>
              <motion.div style={{
                ...S.archWrapper,
                opacity: mArcharOp,
                scale:   mScale,
                rotate:  mRotate,
              }}>
                <svg
                  viewBox="1528 6 395 461"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  <defs>
                    <filter id="intro-glow" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur ref={blurRef} in="SourceAlpha" stdDeviation="80" result="blur" />
                      <feFlood floodColor="#ff4a0a" floodOpacity="1" result="orange" />
                      <feComposite in="orange" in2="blur" operator="in" result="cb" />
                      <feMerge>
                        <feMergeNode in="cb" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <g transform="translate(0,1307) scale(0.1,-0.1)" fill="#ff4a0a" stroke="none"
                    filter="url(#intro-glow)">
                    <path d={ARCHAR_PATH} />
                  </g>
                </svg>
              </motion.div>
            </div>
          )}

          {/* ── Phase 2: Full logo SVG with letter stagger ────── */}
          {showLogo && (
            <div style={S.logoOuter}>
              <motion.div
                ref={logoRef}
                style={{
                  width: '46vw',
                  maxWidth: '500px',
                  minWidth: '220px',
                  x: mLogoX,
                  y: mLogoY,
                  scale: mLogoScale,
                }}
              >
                <svg
                  viewBox="0 0 3567 1307"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '100%', height: 'auto', overflow: 'visible' }}
                >
                  {/* Wordmark letters — stagger C→h→u→D→o */}
                  <g transform="translate(0,1307) scale(0.1,-0.1)" fill="#f4f5f2" stroke="none">
                    {letters[0] && (
                      <motion.g initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={LETTER_TR}>
                        <path d={P_C} />
                      </motion.g>
                    )}
                    {letters[1] && (
                      <motion.g initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={LETTER_TR}>
                        <path d={P_H} />
                      </motion.g>
                    )}
                    {letters[3] && (
                      <motion.g initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={LETTER_TR}>
                        <path d={P_U} />
                      </motion.g>
                    )}
                    {letters[2] && (
                      <motion.g initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={LETTER_TR}>
                        <path d={P_D} />
                      </motion.g>
                    )}
                    {letters[4] && (
                      <motion.g initial={{opacity:0,y:22}} animate={{opacity:1,y:0}} transition={LETTER_TR}>
                        <path d={P_O} />
                      </motion.g>
                    )}
                  </g>
                  {/* Archar in logo */}
                  <motion.g
                    transform="translate(0,1307) scale(0.1,-0.1)"
                    fill="#ff4a0a" stroke="none"
                    initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.2}}
                  >
                    <path d={ARCHAR_PATH} />
                  </motion.g>
                </svg>
              </motion.div>
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
}

const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#000',
  },
  cutVideo: {
    position: 'absolute', inset: 0,
    width: '100vw', height: '100vh',
    objectFit: 'cover',
    transition: 'opacity 40ms linear',
  },
  flashDiv: {
    position: 'absolute', inset: 0,
    background: '#fff',
    pointerEvents: 'none',
    zIndex: 2,
  },
  vignette: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
    pointerEvents: 'none',
    zIndex: 3,
  },
  logoOuter: {
    position: 'absolute', inset: 0, zIndex: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  archWrapper: {
    height: '40vh',
    aspectRatio: '395 / 461',
    flexShrink: 0,
  },
};
