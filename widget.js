/*!
 * Einfach Anfrage Widget v2.0.0
 * Das elegante Anfrage-Widget für Hochzeitsfotografen
 * https://einfachanfrage.de
 */
(function (w, d) {
  'use strict';

  if (w.__einfachAnfrage) return;
  w.__einfachAnfrage = true;

  const currentScript =
    d.currentScript ||
    (function () {
      const s = d.getElementsByTagName('script');
      return s[s.length - 1];
    })();

  const scriptOrigin = currentScript.src
    ? new URL(currentScript.src).origin
    : w.location.origin;

  const CONFIG = {
    photographerEmail: currentScript.getAttribute('data-email') || '',
    photographerName:
      currentScript.getAttribute('data-name') || 'Ihr/e Fotograf/in',
    webhookUrl: currentScript.getAttribute('data-webhook') || '',
    apiUrl:
      currentScript.getAttribute('data-api') ||
      scriptOrigin + '/api/submissions',
    theme: currentScript.getAttribute('data-theme') || 'champagne',
    // 'email' = nur E-Mail | 'dashboard' = nur Dashboard | 'both' = beides (Standard)
    delivery: currentScript.getAttribute('data-delivery') || 'both',
  };

  // ──────────────────────────────────────────────────────────────────────────
  // CSS
  // ──────────────────────────────────────────────────────────────────────────
  const SHADOW_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }
    :host { all: initial; }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,26,26,0.72);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      z-index: 2147483646;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.28s ease;
      font-family: 'Inter', sans-serif;
    }
    .overlay.visible { opacity: 1; }

    .modal {
      background: #FAF7F2;
      border-radius: 18px;
      width: 100%;
      max-width: 596px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 28px 72px rgba(26,26,26,0.22);
      transform: translateY(22px) scale(0.98);
      transition: transform 0.32s cubic-bezier(0.34,1.56,0.64,1);
    }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { height: 3px; background: #EDE8E0; flex-shrink: 0; }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #C9A96E 0%, #C4917A 100%);
      transition: width 0.4s ease;
      border-radius: 3px;
    }

    .modal-header {
      padding: 22px 26px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 15px;
      font-weight: 500;
      color: #C9A96E;
      letter-spacing: 0.06em;
      line-height: 1;
    }
    .close-btn {
      width: 34px; height: 34px;
      border: none; background: transparent; cursor: pointer;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #8A8580;
      transition: background 0.18s, color 0.18s;
      flex-shrink: 0;
    }
    .close-btn:hover { background: #E8E3DA; color: #1A1A1A; }
    .close-btn svg { display: block; }

    .modal-content {
      flex: 1;
      overflow-y: auto;
      padding: 4px 28px 28px;
      scrollbar-width: thin;
      scrollbar-color: #C9A96E transparent;
    }
    .modal-content::-webkit-scrollbar { width: 4px; }
    .modal-content::-webkit-scrollbar-thumb { background: #C9A96E; border-radius: 2px; }

    .step { display: none; }
    .step.active { display: block; animation: fadeSlideIn 0.28s ease; }
    .step.active.back { animation: fadeSlideInLeft 0.28s ease; }

    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateX(14px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeSlideInLeft {
      from { opacity: 0; transform: translateX(-14px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .step-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 30px; font-weight: 400;
      color: #1A1A1A; line-height: 1.15;
      margin: 0 0 8px;
    }
    .step-subtitle {
      font-size: 14px; color: #8A8580;
      line-height: 1.65; margin: 0 0 28px;
    }

    .field { margin-bottom: 18px; }
    .field-label {
      display: block; font-size: 11px; font-weight: 600;
      color: #8A8580; text-transform: uppercase;
      letter-spacing: 0.09em; margin-bottom: 7px;
    }
    .field-label .req { color: #C4917A; margin-left: 2px; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    input[type="text"],
    input[type="email"],
    input[type="tel"],
    input[type="date"],
    select,
    textarea {
      width: 100%;
      padding: 11px 15px;
      font-family: 'Inter', sans-serif;
      font-size: 14px; color: #1A1A1A;
      background: #fff;
      border: 1.5px solid #E2DDD6;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.18s;
      appearance: none; -webkit-appearance: none;
    }
    input::placeholder, textarea::placeholder { color: #C0B9B0; }
    input:focus, select:focus, textarea:focus { border-color: #C9A96E; }
    input.err, select.err { border-color: #C4917A; }

    select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A8580' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 13px center;
      padding-right: 40px;
      cursor: pointer;
    }
    textarea { min-height: 96px; resize: vertical; line-height: 1.55; }

    .err-msg { font-size: 12px; color: #C4917A; margin-top: 5px; display: none; }
    .err-msg.show { display: block; }

    /* Checkboxes */
    .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .check-item {
      display: flex; align-items: center; gap: 9px;
      padding: 11px 13px;
      background: #fff; border: 1.5px solid #E2DDD6;
      border-radius: 8px; cursor: pointer;
      font-size: 13px; color: #1A1A1A;
      line-height: 1.35;
      transition: border-color 0.18s, background 0.18s;
      user-select: none;
    }
    .check-item:hover { border-color: #C9A96E; background: #FEFCF8; }
    .check-item.checked { border-color: #C9A96E; background: rgba(201,169,110,0.09); }
    .check-item input[type="checkbox"] {
      width: 15px; height: 15px;
      accent-color: #C9A96E; flex-shrink: 0; cursor: pointer;
    }

    /* Radio pills */
    .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .radio-item {
      flex: 1; min-width: 70px;
      display: flex; align-items: center; justify-content: center;
      padding: 10px 12px;
      background: #fff; border: 1.5px solid #E2DDD6;
      border-radius: 8px; cursor: pointer;
      font-size: 13px; color: #1A1A1A;
      text-align: center;
      transition: border-color 0.18s, background 0.18s, color 0.18s;
      user-select: none;
    }
    .radio-item:hover { border-color: #C9A96E; background: #FEFCF8; }
    .radio-item.checked {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.09);
      color: #9A7A3E; font-weight: 600;
    }
    .radio-item input[type="radio"] { display: none; }

    /* Media-type pills – größer und prominenter */
    .media-group { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
    .media-item {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 6px;
      padding: 16px 10px;
      background: #fff; border: 1.5px solid #E2DDD6;
      border-radius: 10px; cursor: pointer;
      font-size: 13px; color: #1A1A1A; text-align: center;
      transition: border-color 0.18s, background 0.18s;
      user-select: none;
    }
    .media-item:hover { border-color: #C9A96E; background: #FEFCF8; }
    .media-item.checked {
      border-color: #C9A96E;
      background: rgba(201,169,110,0.09);
      color: #9A7A3E; font-weight: 600;
    }
    .media-item input[type="radio"] { display: none; }
    .media-icon { display: flex; align-items: center; justify-content: center; }

    /* "Noch unklar" toggle */
    .unclear-row {
      display: flex; align-items: center; gap: 8px;
      margin-top: 9px; cursor: pointer; user-select: none;
    }
    .unclear-row input[type="checkbox"] {
      width: 14px; height: 14px;
      accent-color: #C9A96E; cursor: pointer;
    }
    .unclear-row span { font-size: 12px; color: #8A8580; }

    /* File upload */
    .upload-area {
      border: 2px dashed #E2DDD6;
      border-radius: 10px;
      padding: 18px 16px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.18s, background 0.18s;
    }
    .upload-area:hover { border-color: #C9A96E; background: #FEFCF8; }
    .upload-area.has-files { border-color: #C9A96E; background: rgba(201,169,110,0.04); }
    .upload-label { font-size: 13px; color: #8A8580; line-height: 1.6; }
    .upload-label strong { color: #1A1A1A; }
    input[type="file"] { display: none; }
    .upload-previews {
      display: flex; gap: 8px; margin-top: 12px;
      flex-wrap: wrap; justify-content: center;
    }
    .upload-thumb-wrap { position: relative; }
    .upload-thumb {
      width: 68px; height: 68px;
      object-fit: cover; border-radius: 7px;
      border: 1.5px solid #E2DDD6; display: block;
    }
    .upload-thumb-del {
      position: absolute; top: -6px; right: -6px;
      width: 18px; height: 18px;
      background: #1A1A1A; color: #FAF7F2;
      border: none; border-radius: 50%;
      font-size: 13px; line-height: 1;
      cursor: pointer; display: flex;
      align-items: center; justify-content: center;
      padding: 0;
    }
    .upload-hint { font-size: 11px; color: #B0A898; margin-top: 6px; }
    .upload-err { font-size: 12px; color: #C4917A; margin-top: 5px; display: none; }
    .upload-err.show { display: block; }

    /* Divider */
    .divider { height: 1px; background: #EDE8E0; margin: 22px 0; }

    /* Welcome */
    .welcome-icon {
      width: 62px; height: 62px;
      background: rgba(201,169,110,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
    }
    .feature-list { list-style: none; padding: 0; margin: 0 0 28px; }
    .feature-list li {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 14px; color: #6A6560;
      padding: 5px 0; line-height: 1.5;
    }
    .feature-list li::before {
      content: '✦'; color: #C9A96E;
      font-size: 11px; margin-top: 3px; flex-shrink: 0;
    }

    /* Navigation */
    .modal-nav {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 28px;
      border-top: 1px solid #EDE8E0;
      flex-shrink: 0;
      background: #FAF7F2;
    }
    .btn {
      font-family: 'Inter', sans-serif;
      font-size: 14px; font-weight: 500;
      padding: 11px 24px;
      border-radius: 8px; border: none;
      cursor: pointer;
      transition: all 0.18s;
      display: inline-flex; align-items: center; gap: 6px;
    }
    .btn-primary { background: #1A1A1A; color: #FAF7F2; }
    .btn-primary:hover { background: #C9A96E; }
    .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary:disabled:hover { background: #1A1A1A; }
    .btn-ghost {
      background: transparent; color: #8A8580;
      border: 1.5px solid #E2DDD6;
    }
    .btn-ghost:hover { color: #1A1A1A; border-color: #1A1A1A; }
    .btn-full {
      width: 100%; justify-content: center;
      padding: 15px; font-size: 15px;
      border-radius: 10px; margin-top: 6px;
    }
    .step-counter { font-size: 12px; color: #B0A898; }

    /* Thank you */
    .thankyou-wrap { text-align: center; padding: 10px 0 4px; }
    .thankyou-icon {
      width: 76px; height: 76px;
      background: rgba(201,169,110,0.1);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 22px;
      animation: heartbeat 2.4s ease-in-out infinite;
    }
    @keyframes heartbeat {
      0%,100% { transform: scale(1); }
      30%      { transform: scale(1.07); }
      60%      { transform: scale(1); }
      80%      { transform: scale(1.04); }
    }
    .summary-card {
      background: #fff; border: 1px solid #E2DDD6;
      border-radius: 12px; padding: 18px 20px;
      margin-top: 24px; text-align: left;
    }
    .summary-card-title {
      font-size: 11px; color: #8A8580;
      text-transform: uppercase; letter-spacing: 0.1em;
      margin-bottom: 12px;
    }
    .summary-row {
      display: flex; gap: 10px;
      padding: 5px 0; font-size: 13px;
      border-bottom: 1px solid #F2EEE8;
    }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { color: #8A8580; width: 130px; flex-shrink: 0; }
    .summary-value { color: #1A1A1A; font-weight: 500; }

    /* Responsive */
    @media (max-width: 520px) {
      .modal { border-radius: 14px; max-height: 96vh; }
      .modal-header { padding: 16px 18px 10px; }
      .modal-content { padding: 2px 18px 22px; }
      .modal-nav { padding: 14px 18px; }
      .step-title { font-size: 24px; }
      .field-row { grid-template-columns: 1fr; }
      .check-grid { grid-template-columns: 1fr; }
      .radio-group { flex-direction: column; }
      .media-group { grid-template-columns: 1fr; }
    }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // THEME OVERRIDES
  // ──────────────────────────────────────────────────────────────────────────

  // ── NACHT: Editorial Dark – schwarz, eckig, Playfair italic, Terrakotta ──
  const THEME_CSS_NACHT = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,700&display=swap');

    /* Overlay & Modal – SCHWARZ, kantig, null Radius */
    .overlay { background: rgba(0,0,0,0.9); }
    .modal { background: #080808; border-radius: 0; box-shadow: 0 40px 100px rgba(0,0,0,0.9); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    /* Fortschrittsbalken – 1px Linie, keine Rundung */
    .progress-bar { background: #1C1C1C; height: 1px; }
    .progress-fill { background: #C9927A; border-radius: 0; }

    /* Header */
    .logo { font-family: 'Playfair Display', serif; font-style: italic; font-size: 13px; color: #C9927A; letter-spacing: 0.01em; font-weight: 400; }
    .close-btn { color: #3A3A3A; border-radius: 0; }
    .close-btn:hover { background: #1C1C1C; color: #F0EDE8; border-radius: 0; }

    /* Inhalt */
    .modal-content { scrollbar-color: #C9927A transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #C9927A; }

    /* Typografie */
    .step-title { font-family: 'Playfair Display', serif; font-style: italic; font-size: 34px; color: #F0EDE8; font-weight: 400; letter-spacing: -0.01em; line-height: 1.1; }
    .step-subtitle { color: #3A3A3A; font-size: 13px; }
    .field-label { color: #444; letter-spacing: 0.14em; }
    .field-label .req { color: #C9927A; }

    /* Felder – NUR Unterlinie, kein Kasten */
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: transparent;
      border: none;
      border-bottom: 1px solid #222;
      border-radius: 0;
      color: #F0EDE8;
      padding: 10px 2px;
    }
    input::placeholder, textarea::placeholder { color: #2E2E2E; }
    input:focus, textarea:focus { border-bottom-color: #C9927A; outline: none; }
    input.err { border-bottom-color: #C4917A; }
    select {
      background: #111;
      border: none;
      border-bottom: 1px solid #222;
      border-radius: 0;
      color: #F0EDE8;
      padding: 10px 32px 10px 2px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 4px center;
    }
    select:focus { border-bottom-color: #C9927A; outline: none; }
    select.err { border-bottom-color: #C4917A; }

    /* Checkboxen – linke Akzentlinie, kein Kasten */
    .check-item { background: transparent; border: none; border-left: 2px solid #1C1C1C; border-radius: 0; color: #444; padding: 9px 9px 9px 13px; }
    .check-item:hover { border-left-color: #C9927A; background: rgba(201,146,122,0.04); }
    .check-item.checked { border-left-color: #C9927A; background: rgba(201,146,122,0.06); color: #F0EDE8; }
    .check-item input[type="checkbox"] { accent-color: #C9927A; }

    /* Radio Pills – eckig */
    .radio-item { background: transparent; border: 1px solid #1C1C1C; border-radius: 0; color: #444; }
    .radio-item:hover { border-color: #C9927A; background: rgba(201,146,122,0.04); color: #C9927A; }
    .radio-item.checked { border-color: #C9927A; background: rgba(201,146,122,0.08); color: #C9927A; font-weight: 600; }

    /* Media Items – eckig */
    .media-item { background: transparent; border: 1px solid #1C1C1C; border-radius: 0; color: #444; }
    .media-item:hover { border-color: #C9927A; background: rgba(201,146,122,0.04); }
    .media-item.checked { border-color: #C9927A; background: rgba(201,146,122,0.08); color: #C9927A; }

    .unclear-row span { color: #3A3A3A; }
    .unclear-row input[type="checkbox"] { accent-color: #C9927A; }

    /* Upload */
    .upload-area { border-color: #1C1C1C; border-radius: 0; border-style: solid; }
    .upload-area:hover { border-color: #C9927A; background: rgba(201,146,122,0.04); }
    .upload-area.has-files { border-color: #C9927A; }
    .upload-label { color: #3A3A3A; }
    .upload-label strong { color: #F0EDE8; }

    .divider { background: #1C1C1C; }
    .welcome-icon { background: rgba(201,146,122,0.1); border-radius: 0; }
    .feature-list li { color: #3A3A3A; }
    .feature-list li::before { content: '—'; color: #C9927A; font-size: 12px; margin-top: 0; }

    /* Navigation – QUADRATISCHE Buttons */
    .modal-nav { background: #080808; border-top: 1px solid #1C1C1C; }
    .btn-primary { background: #C9927A; color: #080808; border-radius: 0; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em; }
    .btn-primary:hover { background: #E0A98E; }
    .btn-primary:disabled:hover { background: #C9927A; }
    .btn-ghost { color: #3A3A3A; border: 1px solid #1C1C1C; border-radius: 0; background: transparent; }
    .btn-ghost:hover { color: #F0EDE8; border-color: #444; }
    .step-counter { color: #2A2A2A; }

    .thankyou-icon { background: rgba(201,146,122,0.1); border-radius: 0; }
    .summary-card { background: #111; border-color: #1C1C1C; border-radius: 0; }
    .summary-card-title { color: #444; }
    .summary-row { border-bottom-color: #1C1C1C; }
    .summary-label { color: #444; }
    .summary-value { color: #F0EDE8; }
  `;

  // ── SAGE: Organisch & Natürlich – salbeigrün, Pill-Formen, weich ──
  const THEME_CSS_SAGE = `
    .overlay { background: rgba(20,40,24,0.6); }
    .modal { background: #F2F7F0; border-radius: 28px; box-shadow: 0 32px 80px rgba(60,100,60,0.2); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #D0E4CC; height: 6px; border-radius: 6px; }
    .progress-fill { background: linear-gradient(90deg, #5A8460, #8AB890); border-radius: 6px; }

    .logo { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 800; color: #3D6B44; letter-spacing: -0.01em; }
    .close-btn { color: #9AB89A; }
    .close-btn:hover { background: #D8EDD4; color: #1E3020; border-radius: 50%; }

    .modal-content { scrollbar-color: #5A8460 transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #5A8460; border-radius: 3px; }

    .step-title { font-family: 'Inter', sans-serif; font-size: 26px; font-weight: 700; color: #1A2E1C; line-height: 1.2; }
    .step-subtitle { color: #6A9070; font-size: 14px; }
    .field-label { color: #7AAA7E; text-transform: none; font-size: 12px; letter-spacing: 0.01em; font-weight: 600; }
    .field-label .req { color: #3D6B44; }

    /* Felder – stark gerundet, PILL-förmig */
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea {
      background: #fff;
      border: 2px solid #D0E4CC;
      border-radius: 50px;
      color: #1A2E1C;
      padding: 12px 20px;
    }
    textarea { border-radius: 20px; }
    input::placeholder, textarea::placeholder { color: #AACAAA; }
    input:focus, select:focus, textarea:focus { border-color: #5A8460; outline: none; }
    input.err, select.err { border-color: #E07060; }
    select { padding-right: 44px; padding-left: 20px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235A8460' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 16px center;
    }

    /* Checkboxen – Pill */
    .check-item { background: #fff; border: 2px solid #D0E4CC; border-radius: 50px; color: #5A7A5E; }
    .check-item:hover { border-color: #5A8460; background: #EAF5E8; }
    .check-item.checked { border-color: #5A8460; background: rgba(90,132,96,0.1); color: #1A2E1C; }
    .check-item input[type="checkbox"] { accent-color: #5A8460; }

    .radio-item { background: #fff; border: 2px solid #D0E4CC; border-radius: 50px; color: #5A7A5E; }
    .radio-item:hover { border-color: #5A8460; background: #EAF5E8; }
    .radio-item.checked { border-color: #5A8460; background: #5A8460; color: #fff; font-weight: 700; }

    .media-item { background: #fff; border: 2px solid #D0E4CC; border-radius: 20px; color: #5A7A5E; }
    .media-item:hover { border-color: #5A8460; background: #EAF5E8; }
    .media-item.checked { border-color: #5A8460; background: #5A8460; color: #fff; }

    .unclear-row span { color: #7AAA7E; }
    .unclear-row input[type="checkbox"] { accent-color: #5A8460; }

    .upload-area { border-color: #D0E4CC; border-radius: 20px; }
    .upload-area:hover { border-color: #5A8460; background: #EAF5E8; }
    .upload-area.has-files { border-color: #5A8460; background: rgba(90,132,96,0.05); }
    .upload-label { color: #7AAA7E; }
    .upload-label strong { color: #1A2E1C; }

    .divider { background: #D0E4CC; }
    .welcome-icon { background: rgba(90,132,96,0.12); border-radius: 50%; }
    .feature-list li { color: #6A9070; }
    .feature-list li::before { color: #5A8460; }

    .modal-nav { background: #F2F7F0; border-top-color: #D0E4CC; }
    .btn-primary { background: #3D6B44; color: #fff; border-radius: 50px; font-weight: 700; padding: 12px 28px; }
    .btn-primary:hover { background: #2A5230; }
    .btn-primary:disabled:hover { background: #3D6B44; }
    .btn-ghost { color: #7AAA7E; border: 2px solid #D0E4CC; border-radius: 50px; background: transparent; }
    .btn-ghost:hover { color: #1A2E1C; border-color: #5A8460; }
    .step-counter { color: #AACAAA; }

    .thankyou-icon { background: rgba(90,132,96,0.12); border-radius: 50%; }
    .summary-card { background: #fff; border-color: #D0E4CC; border-radius: 20px; }
    .summary-card-title { color: #7AAA7E; }
    .summary-row { border-bottom-color: #EAF5E8; }
    .summary-label { color: #7AAA7E; }
    .summary-value { color: #1A2E1C; }
  `;

  // ── CLEAN: Ultra-minimal & Abstrakt – weiß, monospace, kein Farbrauschen ──
  const THEME_CSS_CLEAN = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    .overlay { background: rgba(0,0,0,0.35); }
    .modal { background: #FFFFFF; border-radius: 2px; box-shadow: 0 4px 40px rgba(0,0,0,0.12); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #F0F0F0; height: 2px; }
    .progress-fill { background: #000; border-radius: 0; }

    .logo { font-family: 'DM Mono', monospace; font-size: 10px; color: #AAAAAA; letter-spacing: 0.04em; font-weight: 300; }
    .close-btn { color: #CCCCCC; border-radius: 0; }
    .close-btn:hover { background: #F5F5F5; color: #000; border-radius: 0; }

    .modal-content { scrollbar-color: #CCCCCC transparent; }
    .modal-content::-webkit-scrollbar-thumb { background: #CCC; }

    .step-title { font-family: 'Inter', sans-serif; font-weight: 300; font-size: 32px; color: #000; letter-spacing: -0.03em; }
    .step-subtitle { color: #AAAAAA; font-size: 13px; }
    .field-label { font-family: 'DM Mono', monospace; font-size: 9px; color: #BBBBBB; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 300; }
    .field-label .req { color: #000; }

    /* Felder – NUR Unterlinie */
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], textarea {
      background: transparent;
      border: none;
      border-bottom: 1px solid #E8E8E8;
      border-radius: 0;
      color: #000;
      padding: 10px 0;
      font-size: 15px;
    }
    input::placeholder, textarea::placeholder { color: #DDDDDD; }
    input:focus, textarea:focus { border-bottom-color: #000; outline: none; }
    input.err { border-bottom-color: #CC0000; }
    select {
      background: transparent;
      border: none;
      border-bottom: 1px solid #E8E8E8;
      border-radius: 0;
      color: #000;
      padding: 10px 32px 10px 0;
      font-size: 15px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23CCCCCC' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 2px center;
    }
    select:focus { border-bottom-color: #000; outline: none; }

    /* Checkboxen – thin border, kein Hintergrund */
    .check-item { background: transparent; border: 1px solid #EBEBEB; border-radius: 0; color: #888; font-size: 13px; }
    .check-item:hover { border-color: #000; background: transparent; color: #000; }
    .check-item.checked { border-color: #000; background: transparent; color: #000; }
    .check-item input[type="checkbox"] { accent-color: #000; }

    .radio-item { background: transparent; border: 1px solid #EBEBEB; border-radius: 0; color: #888; font-size: 13px; }
    .radio-item:hover { border-color: #000; background: transparent; color: #000; }
    .radio-item.checked { border-color: #000; background: #000; color: #fff; font-weight: 400; }

    .media-item { background: transparent; border: 1px solid #EBEBEB; border-radius: 0; color: #888; }
    .media-item:hover { border-color: #000; background: transparent; }
    .media-item.checked { border-color: #000; background: #000; color: #fff; }

    .unclear-row span { color: #BBBBBB; }
    .unclear-row input[type="checkbox"] { accent-color: #000; }

    .upload-area { border-color: #EBEBEB; border-radius: 0; }
    .upload-area:hover { border-color: #000; background: transparent; }
    .upload-area.has-files { border-color: #000; }
    .upload-label { color: #BBBBBB; }
    .upload-label strong { color: #000; }

    .divider { background: #F0F0F0; }
    .welcome-icon { background: #F5F5F5; border-radius: 0; }
    .feature-list li { color: #AAAAAA; }
    .feature-list li::before { content: '/'; color: #CCCCCC; font-family: 'DM Mono', monospace; font-size: 12px; }

    /* Navigation – Ghost-Buttons, kein Radius */
    .modal-nav { background: #FFF; border-top-color: #F0F0F0; }
    .btn-primary { background: transparent; color: #000; border: 1px solid #000; border-radius: 0; font-weight: 400; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; }
    .btn-primary:hover { background: #000; color: #fff; }
    .btn-primary:disabled { opacity: 0.2; }
    .btn-primary:disabled:hover { background: transparent; color: #000; }
    .btn-ghost { color: #CCC; border: 1px solid #EBEBEB; border-radius: 0; background: transparent; }
    .btn-ghost:hover { color: #000; border-color: #000; }
    .step-counter { font-family: 'DM Mono', monospace; color: #DDDDDD; font-size: 11px; font-weight: 300; }

    .thankyou-icon { background: #F5F5F5; border-radius: 0; }
    .summary-card { background: #FAFAFA; border-color: #EBEBEB; border-radius: 0; }
    .summary-card-title { font-family: 'DM Mono', monospace; color: #CCCCCC; font-weight: 300; }
    .summary-row { border-bottom-color: #F5F5F5; }
    .summary-label { color: #BBBBBB; }
    .summary-value { color: #000; font-weight: 400; }
  `;

  // ── MODERN: Bold & Grafisch – navy, Outfit ExtraBold, Coral, Pill-Formen ──
  const THEME_CSS_MODERN = `
    .overlay { background: rgba(30,26,22,0.65); }
    .modal { background: #EDEAE4; border-radius: 0; box-shadow: 0 32px 80px rgba(0,0,0,0.18); }
    .overlay.visible .modal { transform: translateY(0) scale(1); }

    .progress-bar { background: #D8D4CC; height: 1px; border-radius: 0; }
    .progress-fill { background: #1A1714; border-radius: 0; }

    .modal-header { border-bottom: none; padding-bottom: 0; }
    .logo { font-family: 'Cormorant Garamond', serif; font-size: 10px; font-weight: 400; color: #9A9390; letter-spacing: 0.22em; text-transform: uppercase; }
    .close-btn { color: #9A9390; border-radius: 0; }
    .close-btn:hover { background: rgba(0,0,0,0.06); color: #1A1714; }

    .step-title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 300; color: #1A1714; letter-spacing: 0.28em; text-transform: uppercase; line-height: 1.2; }
    .step-subtitle { color: #9A9390; font-size: 12px; letter-spacing: 0.04em; }
    .field-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 400; color: #9A9390; text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 2px; }
    .field-label .req { color: #B8A898; }

    /* Felder – nur Unterstrich */
    input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea {
      background: transparent;
      border: none;
      border-bottom: 1px solid #C4BFB8;
      border-radius: 0;
      color: #1A1714;
      padding: 10px 0;
      font-size: 14px;
    }
    textarea { border-bottom: 1px solid #C4BFB8; padding-bottom: 10px; min-height: 80px; }
    input::placeholder, textarea::placeholder { color: #BAB6AF; }
    input:focus, select:focus, textarea:focus { border-bottom-color: #1A1714; outline: none; background: transparent; box-shadow: none; }
    input.err, select.err { border-bottom-color: #9B6B5A; }
    select { padding-right: 24px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%239A9390' stroke-width='1.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 4px center;
    }

    /* Checkboxen – flach, Linie */
    .check-item { background: transparent; border: none; border-bottom: 1px solid #D4CFC8; border-radius: 0; color: #9A9390; padding: 10px 0; }
    .check-item:hover { background: rgba(0,0,0,0.03); color: #1A1714; }
    .check-item.checked { border-bottom-color: #1A1714; color: #1A1714; background: transparent; }
    .check-item input[type="checkbox"] { accent-color: #1A1714; }

    .radio-item { background: transparent; border: 1px solid #C4BFB8; border-radius: 0; color: #9A9390; }
    .radio-item:hover { border-color: #1A1714; color: #1A1714; }
    .radio-item.checked { border-color: #1A1714; background: #1A1714; color: #EDEAE4; font-weight: 400; }

    .media-item { background: transparent; border: 1px solid #C4BFB8; border-radius: 0; color: #9A9390; }
    .media-item:hover { border-color: #1A1714; color: #1A1714; }
    .media-item.checked { border-color: #1A1714; background: rgba(26,23,20,0.07); color: #1A1714; }

    .unclear-row span { color: #9A9390; }
    .unclear-row input[type="checkbox"] { accent-color: #1A1714; }

    .upload-area { border-color: #C4BFB8; border-radius: 0; background: transparent; }
    .upload-area:hover { border-color: #1A1714; background: rgba(0,0,0,0.02); }
    .upload-area.has-files { border-color: #1A1714; }
    .upload-label { color: #9A9390; }
    .upload-label strong { color: #1A1714; }

    .divider { background: #C4BFB8; }
    .welcome-icon { background: rgba(0,0,0,0.06); border-radius: 0; }
    .feature-list li { color: #9A9390; }
    .feature-list li::before { color: #1A1714; }

    /* Navigation – flache Buttons */
    .modal-nav { background: #E5E1DB; border-top: 1px solid #C4BFB8; }
    .btn-primary { background: #1A1714; color: #EDEAE4; border-radius: 0; font-weight: 400; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; padding: 13px 28px; font-family: 'Inter', sans-serif; }
    .btn-primary:hover { background: #2E2A26; }
    .btn-primary:disabled:hover { background: #1A1714; }
    .btn-ghost { color: #9A9390; border: 1px solid #C4BFB8; border-radius: 0; background: transparent; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
    .btn-ghost:hover { color: #1A1714; border-color: #1A1714; }
    .step-counter { color: #B8B4AC; letter-spacing: 0.06em; }

    .thankyou-icon { background: rgba(0,0,0,0.06); border-radius: 0; }
    .summary-card { background: rgba(0,0,0,0.04); border-color: #C4BFB8; border-radius: 0; }
    .summary-card-title { color: #9A9390; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; font-size: 10px; }
    .summary-row { border-bottom-color: #D4CFC8; }
    .summary-label { color: #9A9390; }
    .summary-value { color: #1A1714; font-weight: 400; }
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // ICONS
  // ──────────────────────────────────────────────────────────────────────────
  const ICON_CLOSE =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  const ICON_RINGS =
    '<svg width="34" height="34" viewBox="0 0 60 60" fill="none" stroke="#C9A96E" stroke-width="2.5" stroke-linecap="round"><circle cx="22" cy="30" r="13"/><circle cx="38" cy="30" r="13"/></svg>';
  const ICON_CAMERA =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';

  // ──────────────────────────────────────────────────────────────────────────
  // HTML (8 Steps)
  // ──────────────────────────────────────────────────────────────────────────
  const MODAL_HTML = `
    <div class="progress-bar"><div class="progress-fill" id="ea-progress"></div></div>
    <div class="modal-header">
      <span class="logo">Einfach Anfrage</span>
      <button class="close-btn" id="ea-close" aria-label="Schließen">${ICON_CLOSE}</button>
    </div>

    <div class="modal-content" id="ea-content">

      <!-- ── Step 1: Willkommen ── -->
      <div class="step active" data-step="1">
        <div class="welcome-icon">${ICON_CAMERA}</div>
        <h2 class="step-title">Herzlich<br>willkommen!</h2>
        <p class="step-subtitle">
          Damit wir euch und eure Vorstellungen für euren besonderen Tag<br>
          kennenlernen – ein paar Fragen, dauert nur <strong>3 Minuten</strong>.
        </p>
        <ul class="feature-list">
          <li>Alle Angaben auch als "noch unklar" beantwortbar</li>
          <li>Keine unerwünschten Abonnements oder Werbung</li>
          <li>Deine Daten werden nur an den Fotografen weitergeleitet</li>
        </ul>
        <button class="btn btn-primary btn-full" id="ea-start">Jetzt starten →</button>
      </div>

      <!-- ── Step 2: Euer großer Tag ── -->
      <div class="step" data-step="2">
        <h2 class="step-title">Euer großer Tag</h2>
        <p class="step-subtitle">Wann und wie lange – auch "noch unklar" ist eine gültige Antwort.</p>

        <div class="field">
          <label class="field-label" for="ea-date">Hochzeitsdatum <span class="req">*</span></label>
          <input type="date" id="ea-date" name="date">
          <label class="unclear-row" id="ea-date-unclear-wrap">
            <input type="checkbox" id="ea-date-unclear"> <span>Datum noch unklar</span>
          </label>
          <div class="err-msg" id="ea-date-err">Bitte ein Datum angeben oder "noch unklar" wählen.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-time">Uhrzeit der Trauung</label>
          <select id="ea-time" name="ceremonyTime">
            <option value="">– bitte wählen –</option>
            <option value="noch unklar">Noch unklar</option>
            <option value="09:00">09:00 Uhr</option>
            <option value="10:00">10:00 Uhr</option>
            <option value="11:00">11:00 Uhr</option>
            <option value="12:00">12:00 Uhr</option>
            <option value="13:00">13:00 Uhr</option>
            <option value="14:00">14:00 Uhr</option>
            <option value="15:00">15:00 Uhr</option>
            <option value="16:00">16:00 Uhr</option>
            <option value="17:00">17:00 Uhr</option>
            <option value="18:00">18:00 Uhr</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="ea-duration">Ungefähre Dauer</label>
          <select id="ea-duration" name="duration">
            <option value="">– bitte wählen –</option>
            <option value="noch unklar">Noch unklar</option>
            <option value="Nur Trauung (~2h)">Nur Trauung (~2h)</option>
            <option value="Trauung + Feier (~6h)">Trauung + Feier (~6h)</option>
            <option value="Ganztag (~10h+)">Ganztag (~10h+)</option>
          </select>
        </div>
      </div>

      <!-- ── Step 3: Location ── -->
      <div class="step" data-step="3">
        <h2 class="step-title">Die Location</h2>
        <p class="step-subtitle">Wo feiert ihr? Mehrfachauswahl ist möglich.</p>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-state">Bundesland</label>
            <select id="ea-state" name="state">
              <option value="">– wählen –</option>
              <option>Ausland / Destination</option>
              <option>Baden-Württemberg</option>
              <option>Bayern</option>
              <option>Berlin</option>
              <option>Brandenburg</option>
              <option>Bremen</option>
              <option>Hamburg</option>
              <option>Hessen</option>
              <option>Mecklenburg-Vorpommern</option>
              <option>Niedersachsen</option>
              <option>Nordrhein-Westfalen</option>
              <option>Rheinland-Pfalz</option>
              <option>Saarland</option>
              <option>Sachsen</option>
              <option>Sachsen-Anhalt</option>
              <option>Schleswig-Holstein</option>
              <option>Thüringen</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="ea-city">Stadt / Ort</label>
            <input type="text" id="ea-city" name="city" placeholder="z. B. München">
          </div>
        </div>

        <div class="field">
          <label class="field-label">Art der Location</label>
          <div class="check-grid" id="ea-location-types">
            <label class="check-item"><input type="checkbox" value="Standesamt"> Standesamt</label>
            <label class="check-item"><input type="checkbox" value="Kirche"> Kirche</label>
            <label class="check-item"><input type="checkbox" value="Freie Trauung"> Freie Trauung</label>
            <label class="check-item"><input type="checkbox" value="Schloss / Villa"> Schloss / Villa</label>
            <label class="check-item"><input type="checkbox" value="Hotel / Restaurant"> Hotel / Restaurant</label>
            <label class="check-item"><input type="checkbox" value="Weingut / Scheune"> Weingut / Scheune</label>
            <label class="check-item"><input type="checkbox" value="Outdoor / Natur"> Outdoor / Natur</label>
            <label class="check-item"><input type="checkbox" value="Strand / Wasser"> Strand / Wasser</label>
            <label class="check-item"><input type="checkbox" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Setting – drinnen oder draußen?</label>
          <div class="radio-group" id="ea-indoor-outdoor">
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Hauptsächlich drinnen"> Drinnen</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Hauptsächlich draußen"> Draußen</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Drinnen & draußen"> Beides</label>
            <label class="radio-item"><input type="radio" name="indoorOutdoor" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Mehrere Locations an dem Tag?</label>
          <div class="radio-group" id="ea-multi-location">
            <label class="radio-item"><input type="radio" name="multiLocation" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="multiLocation" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="multiLocation" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-location-address">Adresse(n) der Location(s) <span style="font-weight:400;text-transform:none;letter-spacing:0;opacity:0.6;">(optional)</span></label>
          <textarea id="ea-location-address" name="locationAddress" rows="3" placeholder="z. B. Schloss Nymphenburg, Schlossrondell 1, 80638 München&#10;Bei mehreren Locations einfach untereinander eintragen."></textarea>
        </div>
      </div>

      <!-- ── Step 4: Leistungen ── -->
      <div class="step" data-step="4">
        <h2 class="step-title">Was soll festgehalten werden?</h2>
        <p class="step-subtitle">Foto, Video oder beides – und was soll alles dazu gehören?</p>

        <div class="field">
          <label class="field-label">Foto & Video <span class="req">*</span></label>
          <div class="media-group" id="ea-media-type">
            <label class="media-item">
              <input type="radio" name="mediaType" value="Nur Fotos">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
              <span>Nur Fotos</span>
            </label>
            <label class="media-item">
              <input type="radio" name="mediaType" value="Fotos + Video">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="3"/><polygon points="17,10 22,7 22,17 17,14" fill="currentColor" stroke="none" style="transform:scale(0.5) translate(14px,6px)"/></svg></span>
              <span>Fotos + Video</span>
            </label>
            <label class="media-item">
              <input type="radio" name="mediaType" value="Nur Video">
              <span class="media-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="23,7 16,12 23,17 23,7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg></span>
              <span>Nur Video</span>
            </label>
          </div>
          <div class="err-msg" id="ea-media-err">Bitte eine Option wählen.</div>
        </div>

        <div class="field">
          <label class="field-label">Getting Ready dabei?</label>
          <div class="radio-group" id="ea-getting-ready">
            <label class="radio-item"><input type="radio" name="gettingReady" value="Ja, beide Partner"> Ja, beide</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Ja, ein Partner"> Ja, einer</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="gettingReady" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Zweiter Fotograf / Kameramann?</label>
          <div class="radio-group" id="ea-second-photographer">
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="secondPhotographer" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Fotobuch / Album gewünscht?</label>
          <div class="radio-group" id="ea-album">
            <label class="radio-item"><input type="radio" name="album" value="Ja"> Ja</label>
            <label class="radio-item"><input type="radio" name="album" value="Nein"> Nein</label>
            <label class="radio-item"><input type="radio" name="album" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>
      </div>

      <!-- ── Step 5: Stil & Stimmung ── -->
      <div class="step" data-step="5">
        <h2 class="step-title">Stil &amp; Stimmung</h2>
        <p class="step-subtitle">Welchen Look wünscht ihr euch? Mehrfachauswahl möglich.</p>

        <div class="field">
          <label class="field-label" for="ea-guests">Anzahl Gäste</label>
          <select id="ea-guests" name="guestCount">
            <option value="">– bitte wählen –</option>
            <option value="Noch unklar">Noch unklar</option>
            <option value="unter 20 (Intim)">unter 20 (Intim)</option>
            <option value="20–50">20–50</option>
            <option value="50–100">50–100</option>
            <option value="100–150">100–150</option>
            <option value="über 150">über 150</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label">Gewünschter Stil</label>
          <div class="check-grid" id="ea-styles">
            <label class="check-item"><input type="checkbox" value="Reportage / Natürlich"> Reportage / Natürlich</label>
            <label class="check-item"><input type="checkbox" value="Romantisch & Inszeniert"> Romantisch & Inszeniert</label>
            <label class="check-item"><input type="checkbox" value="Modern & Editorial"> Modern & Editorial</label>
            <label class="check-item"><input type="checkbox" value="Klassisch & Elegant"> Klassisch & Elegant</label>
            <label class="check-item"><input type="checkbox" value="Fine Art"> Fine Art</label>
            <label class="check-item"><input type="checkbox" value="Dark & Moody"> Dark & Moody</label>
            <label class="check-item"><input type="checkbox" value="Boho / Verspielt"> Boho / Verspielt</label>
            <label class="check-item"><input type="checkbox" value="Hell & Luftig"> Hell & Luftig</label>
            <label class="check-item"><input type="checkbox" value="Vintage"> Vintage</label>
            <label class="check-item"><input type="checkbox" value="Klassisch & Zeitlos"> Klassisch & Zeitlos</label>
            <label class="check-item"><input type="checkbox" value="Filmisch / Analog"> Filmisch / Analog</label>
            <label class="check-item"><input type="checkbox" value="Schwarz-Weiß"> Schwarz-Weiß</label>
            <label class="check-item"><input type="checkbox" value="Farbenfroh & Lebendig"> Farbenfroh & Lebendig</label>
            <label class="check-item"><input type="checkbox" value="Luxuriös & Glamourös"> Luxuriös & Glamourös</label>
            <label class="check-item"><input type="checkbox" value="Clean & Minimalistisch"> Clean & Minimalistisch</label>
            <label class="check-item"><input type="checkbox" value="Noch unklar"> Noch unklar</label>
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-style-notes">Stil in eigenen Worten <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-style-notes" name="styleNotes" placeholder="z. B. „Ruhige Stimmung, nicht zu viel Inszenierung – lieber echte Momente als gestellte Posen.""></textarea>
        </div>

        <div class="field">
          <label class="field-label">Inspirationsbilder <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional · max. 3 Fotos)</span></label>
          <div class="upload-area" id="ea-upload-area">
            <input type="file" id="ea-file-input" accept="image/jpeg,image/png,image/webp" multiple>
            <div class="upload-label" id="ea-upload-label">
              <strong>Klicken zum Hochladen</strong> oder Bilder hierher ziehen<br>
              <span style="font-size:12px;color:#B0A898;">Zeigt dem Fotografen euren Wunsch-Look</span>
            </div>
            <div class="upload-previews" id="ea-upload-previews"></div>
          </div>
          <div class="upload-hint">JPG, PNG oder WEBP · max. 2 MB pro Bild · max. 3 Bilder</div>
          <div class="upload-err" id="ea-upload-err"></div>
        </div>
      </div>

      <!-- ── Step 6: Budget ── -->
      <div class="step" data-step="6">
        <h2 class="step-title">Budget &amp; Vorstellung</h2>
        <p class="step-subtitle">Keine Pflicht – aber es hilft uns, das passende Paket zu empfehlen.</p>

        <div class="field">
          <label class="field-label" for="ea-budget">Euer Budgetrahmen</label>
          <select id="ea-budget" name="budget">
            <option value="">– bitte wählen –</option>
            <option value="Noch unklar">Noch unklar</option>
            <option value="Möchte ich nicht angeben">Möchte ich nicht angeben</option>
            <option value="unter 1.000 €">unter 1.000 €</option>
            <option value="1.000–1.500 €">1.000–1.500 €</option>
            <option value="1.500–2.500 €">1.500–2.500 €</option>
            <option value="2.500–4.000 €">2.500–4.000 €</option>
            <option value="4.000–6.000 €">4.000–6.000 €</option>
            <option value="über 6.000 €">über 6.000 €</option>
          </select>
        </div>

        <div class="field">
          <label class="field-label" for="ea-notes">Besondere Wünsche <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <textarea id="ea-notes" name="notes" placeholder="Was ist euch besonders wichtig? Gibt es spezielle Momente, Personen oder Ideen, die unbedingt festgehalten werden sollen?"></textarea>
        </div>
      </div>

      <!-- ── Step 7: Kontakt ── -->
      <div class="step" data-step="7">
        <h2 class="step-title">Wie können wir<br>euch erreichen?</h2>
        <p class="step-subtitle">Nur die E-Mail ist Pflicht – alles andere ist freiwillig.</p>

        <div class="field-row">
          <div class="field">
            <label class="field-label" for="ea-partner1">Vorname Partner 1</label>
            <input type="text" id="ea-partner1" name="partner1" placeholder="z. B. Sophie">
          </div>
          <div class="field">
            <label class="field-label" for="ea-partner2">Vorname Partner 2</label>
            <input type="text" id="ea-partner2" name="partner2" placeholder="z. B. Thomas">
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-email">E-Mail-Adresse <span class="req">*</span></label>
          <input type="email" id="ea-email" name="email" placeholder="eure@email.de">
          <div class="err-msg" id="ea-email-err">Bitte eine gültige E-Mail-Adresse eingeben.</div>
        </div>

        <div class="field">
          <label class="field-label" for="ea-phone">Telefon <span style="font-weight:400;text-transform:none;letter-spacing:0;">(optional)</span></label>
          <input type="tel" id="ea-phone" name="phone" placeholder="+49 176 …">
        </div>

        <div class="field">
          <label class="field-label" for="ea-found">Wie habt ihr uns gefunden?</label>
          <select id="ea-found" name="howFound">
            <option value="">– bitte wählen –</option>
            <option>Google</option>
            <option>Instagram</option>
            <option>Pinterest</option>
            <option>Empfehlung</option>
            <option>Hochzeitsportal</option>
            <option>Sonstiges</option>
          </select>
        </div>
      </div>

      <!-- ── Step 8: Bestätigung ── -->
      <div class="step" data-step="8">
        <div class="thankyou-wrap">
          <div class="thankyou-icon">${ICON_RINGS}</div>
          <h2 class="step-title">Vielen Dank!</h2>
          <p class="step-subtitle" id="ea-thankyou-text">
            <strong>${CONFIG.photographerName}</strong> meldet sich innerhalb von<br>
            <strong>48 Stunden</strong> bei euch.
          </p>
          <div class="summary-card" id="ea-summary"></div>
        </div>
      </div>

    </div><!-- /modal-content -->

    <div class="modal-nav" id="ea-nav">
      <button class="btn btn-ghost" id="ea-back" style="visibility:hidden;">← Zurück</button>
      <span class="step-counter" id="ea-counter"></span>
      <button class="btn btn-primary" id="ea-next">Weiter →</button>
    </div>
  `;

  // ──────────────────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────────────────
  const TOTAL_STEPS = 8;
  let currentStep = 1;
  let formData = {};
  let uploadedFiles = []; // [{name, data, type}]
  let shadowRoot, overlay, modalEl, progressFill, navEl, backBtn, nextBtn, counter;

  // ──────────────────────────────────────────────────────────────────────────
  // CREATE WIDGET
  // ──────────────────────────────────────────────────────────────────────────
  function createWidget() {
    const host = d.createElement('div');
    host.id = 'ea-widget-root';
    d.body.appendChild(host);

    shadowRoot = host.attachShadow({ mode: 'open' });

    const style = d.createElement('style');
    style.textContent = SHADOW_CSS;
    shadowRoot.appendChild(style);

    const themeMap = { nacht: THEME_CSS_NACHT, sage: THEME_CSS_SAGE, clean: THEME_CSS_CLEAN, modern: THEME_CSS_MODERN };
    if (themeMap[CONFIG.theme]) {
      const themeStyle = d.createElement('style');
      themeStyle.textContent = themeMap[CONFIG.theme];
      shadowRoot.appendChild(themeStyle);
    }

    overlay = d.createElement('div');
    overlay.className = 'overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Anfrage stellen');
    overlay.innerHTML = '<div class="modal">' + MODAL_HTML + '</div>';
    shadowRoot.appendChild(overlay);

    progressFill = shadowRoot.getElementById('ea-progress');
    navEl        = shadowRoot.getElementById('ea-nav');
    backBtn      = shadowRoot.getElementById('ea-back');
    nextBtn      = shadowRoot.getElementById('ea-next');
    counter      = shadowRoot.getElementById('ea-counter');
    modalEl      = overlay.querySelector('.modal');

    // Base events
    shadowRoot.getElementById('ea-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    shadowRoot.getElementById('ea-start').addEventListener('click', function () { goToStep(2); });
    backBtn.addEventListener('click', function () { if (currentStep > 2) goToStep(currentStep - 1, true); });
    nextBtn.addEventListener('click', handleNext);

    // Check-item interactivity — use 'change' to avoid double-toggle from wrapping label
    shadowRoot.querySelectorAll('.check-grid').forEach(function (grid) {
      grid.querySelectorAll('.check-item').forEach(function (item) {
        var cb = item.querySelector('input[type="checkbox"]');
        cb.addEventListener('change', function () {
          item.classList.toggle('checked', cb.checked);
        });
      });
    });

    // Radio-item interactivity (standard .radio-group)
    shadowRoot.querySelectorAll('.radio-group').forEach(function (group) {
      group.querySelectorAll('.radio-item').forEach(function (item) {
        var radio = item.querySelector('input[type="radio"]');
        radio.addEventListener('change', function () {
          group.querySelectorAll('.radio-item').forEach(function (ri) { ri.classList.remove('checked'); });
          item.classList.add('checked');
        });
      });
    });

    // Media-type interactivity (.media-group)
    var mediaGroup = shadowRoot.getElementById('ea-media-type');
    if (mediaGroup) {
      mediaGroup.querySelectorAll('.media-item').forEach(function (item) {
        var radio = item.querySelector('input[type="radio"]');
        radio.addEventListener('change', function () {
          mediaGroup.querySelectorAll('.media-item').forEach(function (mi) { mi.classList.remove('checked'); });
          item.classList.add('checked');
        });
      });
    }

    // Date "noch unklar" toggle
    var dateInput   = shadowRoot.getElementById('ea-date');
    var dateUnclear = shadowRoot.getElementById('ea-date-unclear');
    dateUnclear.addEventListener('change', function () {
      dateInput.disabled = dateUnclear.checked;
      dateInput.style.opacity = dateUnclear.checked ? '0.4' : '1';
      if (dateUnclear.checked) dateInput.value = '';
    });

    // File upload
    initFileUpload();

    // Escape to close
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD
  // ──────────────────────────────────────────────────────────────────────────
  function initFileUpload() {
    var area     = shadowRoot.getElementById('ea-upload-area');
    var input    = shadowRoot.getElementById('ea-file-input');
    var previews = shadowRoot.getElementById('ea-upload-previews');
    var label    = shadowRoot.getElementById('ea-upload-label');
    var errEl    = shadowRoot.getElementById('ea-upload-err');

    if (!area) return;

    area.addEventListener('click', function (e) {
      if (e.target.classList.contains('upload-thumb-del')) return;
      if (uploadedFiles.length < 3) input.click();
    });

    input.addEventListener('change', function () {
      handleUploadFiles(Array.from(input.files), previews, label, errEl);
      input.value = '';
    });

    area.addEventListener('dragover', function (e) {
      e.preventDefault();
      area.style.borderColor = '#C9A96E';
    });
    area.addEventListener('dragleave', function () {
      area.style.borderColor = uploadedFiles.length ? '#C9A96E' : '';
    });
    area.addEventListener('drop', function (e) {
      e.preventDefault();
      handleUploadFiles(Array.from(e.dataTransfer.files), previews, label, errEl);
    });
  }

  function handleUploadFiles(files, previews, label, errEl) {
    errEl.classList.remove('show');
    files.forEach(function (file) {
      if (uploadedFiles.length >= 3) { showUploadErr(errEl, 'Maximal 3 Bilder erlaubt.'); return; }
      if (!file.type.startsWith('image/')) { showUploadErr(errEl, 'Nur Bildformate erlaubt (JPG, PNG, WEBP).'); return; }
      if (file.size > 2 * 1024 * 1024) { showUploadErr(errEl, file.name + ' ist zu groß (max. 2 MB).'); return; }

      var reader = new FileReader();
      reader.onload = function (e) {
        uploadedFiles.push({ name: file.name, data: e.target.result, type: file.type });
        renderPreviews(previews, label);
      };
      reader.readAsDataURL(file);
    });
  }

  function showUploadErr(errEl, msg) {
    errEl.textContent = msg;
    errEl.classList.add('show');
  }

  function renderPreviews(previews, label) {
    previews.innerHTML = uploadedFiles.map(function (f, i) {
      return '<div class="upload-thumb-wrap">' +
        '<img class="upload-thumb" src="' + f.data + '" alt="' + f.name + '">' +
        '<button class="upload-thumb-del" data-idx="' + i + '" title="Entfernen">×</button>' +
        '</div>';
    }).join('');

    if (label) label.style.display = uploadedFiles.length >= 3 ? 'none' : '';

    var area = shadowRoot.getElementById('ea-upload-area');
    if (area) area.classList.toggle('has-files', uploadedFiles.length > 0);

    previews.querySelectorAll('.upload-thumb-del').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        uploadedFiles.splice(parseInt(btn.dataset.idx), 1);
        renderPreviews(
          shadowRoot.getElementById('ea-upload-previews'),
          shadowRoot.getElementById('ea-upload-label')
        );
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────
  function goToStep(n, back) {
    shadowRoot.querySelectorAll('.step').forEach(function (s) { s.classList.remove('active', 'back'); });
    var target = shadowRoot.querySelector('[data-step="' + n + '"]');
    if (!target) return;
    currentStep = n;
    target.classList.add('active');
    if (back) target.classList.add('back');
    updateNav();
    updateProgress();
    var content = shadowRoot.getElementById('ea-content');
    if (content) content.scrollTop = 0;
  }

  function updateNav() {
    var isFirst = currentStep === 1;
    var isLast  = currentStep === TOTAL_STEPS;
    navEl.style.display = (isFirst || isLast) ? 'none' : 'flex';
    if (!isFirst && !isLast) {
      backBtn.style.visibility = currentStep === 2 ? 'hidden' : 'visible';
      nextBtn.textContent = currentStep === 7 ? 'Abschicken ✓' : 'Weiter →';
      counter.textContent = 'Schritt ' + (currentStep - 1) + ' von 6';
    }
  }

  function updateProgress() {
    var pct = currentStep === 1 ? 0 : Math.round(((currentStep - 1) / 7) * 100);
    progressFill.style.width = pct + '%';
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION
  // ──────────────────────────────────────────────────────────────────────────
  function validateStep(step) {
    clearErrors();

    if (step === 2) {
      var dateInput   = shadowRoot.getElementById('ea-date');
      var dateUnclear = shadowRoot.getElementById('ea-date-unclear');
      if (!dateUnclear.checked && !dateInput.value) {
        showError('ea-date-err', 'ea-date');
        return false;
      }
    }

    if (step === 4) {
      var mediaRadio = shadowRoot.querySelector('input[name="mediaType"]:checked');
      if (!mediaRadio) {
        showError('ea-media-err', null);
        return false;
      }
    }

    if (step === 7) {
      var emailInput = shadowRoot.getElementById('ea-email');
      var emailVal   = emailInput.value.trim();
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        showError('ea-email-err', 'ea-email');
        return false;
      }
    }

    return true;
  }

  function showError(errId, fieldId) {
    var errEl = shadowRoot.getElementById(errId);
    if (errEl) errEl.classList.add('show');
    if (fieldId) {
      var fieldEl = shadowRoot.getElementById(fieldId);
      if (fieldEl) fieldEl.classList.add('err');
    }
  }

  function clearErrors() {
    shadowRoot.querySelectorAll('.err-msg').forEach(function (e) { e.classList.remove('show'); });
    shadowRoot.querySelectorAll('.err').forEach(function (e) { e.classList.remove('err'); });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // COLLECT FORM DATA
  // ──────────────────────────────────────────────────────────────────────────
  function collectFormData() {
    var dateEl        = shadowRoot.getElementById('ea-date');
    var dateUnclearEl = shadowRoot.getElementById('ea-date-unclear');
    var dateUnclear   = dateUnclearEl.checked;

    var locationTypes = [];
    shadowRoot.querySelectorAll('#ea-location-types input:checked').forEach(function (cb) {
      locationTypes.push(cb.value);
    });

    var styles = [];
    shadowRoot.querySelectorAll('#ea-styles input:checked').forEach(function (cb) {
      styles.push(cb.value);
    });

    var getVal = function (name) {
      var el = shadowRoot.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    };

    return {
      photographerEmail: CONFIG.photographerEmail,
      photographerName:  CONFIG.photographerName,
      delivery:          CONFIG.delivery,
      wedding: {
        date:         dateUnclear ? null : (dateEl.value || null),
        dateUnclear:  dateUnclear,
        ceremonyTime: shadowRoot.getElementById('ea-time').value || null,
        duration:     shadowRoot.getElementById('ea-duration').value || null,
      },
      location: {
        state:             shadowRoot.getElementById('ea-state').value || null,
        city:              shadowRoot.getElementById('ea-city').value.trim() || null,
        types:             locationTypes,
        indoorOutdoor:     getVal('indoorOutdoor'),
        multipleLocations: getVal('multiLocation'),
        address:           shadowRoot.getElementById('ea-location-address').value.trim() || null,
      },
      services: {
        mediaType:         getVal('mediaType'),
        gettingReady:      getVal('gettingReady'),
        secondPhotographer: getVal('secondPhotographer'),
        album:             getVal('album'),
      },
      style: {
        guestCount:  shadowRoot.getElementById('ea-guests').value || null,
        styles:      styles,
        styleNotes:  shadowRoot.getElementById('ea-style-notes').value.trim() || null,
        inspirationImages: uploadedFiles.map(function (f) {
          return { name: f.name, data: f.data };
        }),
      },
      budget: {
        range: shadowRoot.getElementById('ea-budget').value || null,
        notes: shadowRoot.getElementById('ea-notes').value.trim() || null,
      },
      contact: {
        partner1: shadowRoot.getElementById('ea-partner1').value.trim() || null,
        partner2: shadowRoot.getElementById('ea-partner2').value.trim() || null,
        email:    shadowRoot.getElementById('ea-email').value.trim(),
        phone:    shadowRoot.getElementById('ea-phone').value.trim() || null,
        howFound: shadowRoot.getElementById('ea-found').value || null,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ──────────────────────────────────────────────────────────────────────────
  async function submitForm() {
    nextBtn.disabled    = true;
    nextBtn.textContent = 'Wird gesendet…';

    try {
      formData = collectFormData();

      // Strip image data for the main API call to keep payload small,
      // send image count instead
      var payloadForApi = JSON.parse(JSON.stringify(formData));
      payloadForApi.style.inspirationImageCount = uploadedFiles.length;
      delete payloadForApi.style.inspirationImages;

      var res = await fetch(CONFIG.apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payloadForApi),
      });
      if (!res.ok) throw new Error('API error ' + res.status);

      if (CONFIG.webhookUrl) {
        fetch(CONFIG.webhookUrl, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payloadForApi),
        }).catch(function () {});
      }

      showThankYou();
    } catch (err) {
      console.error('[EinfachAnfrage] Fehler:', err);
      nextBtn.disabled    = false;
      nextBtn.textContent = 'Erneut versuchen';
      showThankYou();
    }
  }

  function showThankYou() {
    buildSummary();
    goToStep(8);
  }

  function buildSummary() {
    var fd = formData;
    if (!fd) return;
    var summary = shadowRoot.getElementById('ea-summary');
    if (!summary) return;

    var weddingDate = fd.wedding.dateUnclear
      ? 'Noch unklar'
      : (fd.wedding.date ? formatDate(fd.wedding.date) : 'Noch unklar');

    var rows = [
      ['Datum',      weddingDate],
      ['Ort',        [fd.location.city, fd.location.state].filter(Boolean).join(', ') || '–'],
      ['Leistung',   fd.services.mediaType || '–'],
      ['Stil',       fd.style.styles.length ? fd.style.styles.join(', ') : '–'],
      ['Budget',     fd.budget.range || '–'],
      ['E-Mail',     fd.contact.email],
    ];

    summary.innerHTML = '<div class="summary-card-title">Eure Zusammenfassung</div>' +
      rows.map(function (r) {
        return '<div class="summary-row">' +
          '<span class="summary-label">' + r[0] + '</span>' +
          '<span class="summary-value">'  + r[1] + '</span>' +
          '</div>';
      }).join('');
  }

  function formatDate(iso) {
    if (!iso) return '–';
    var dt = new Date(iso);
    return dt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // NEXT HANDLER
  // ──────────────────────────────────────────────────────────────────────────
  function handleNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep === 7) {
      submitForm();
    } else if (currentStep < 7) {
      goToStep(currentStep + 1);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // OPEN / CLOSE
  // ──────────────────────────────────────────────────────────────────────────
  function openModal() {
    if (!shadowRoot) createWidget();

    currentStep   = 1;
    formData      = {};
    uploadedFiles = [];
    goToStep(1);

    // Reset form fields
    if (shadowRoot) {
      shadowRoot.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], select, textarea').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') return;
        el.value = '';
      });
      shadowRoot.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(function (el) {
        el.checked = false;
      });
      shadowRoot.querySelectorAll('.check-item, .radio-item, .media-item').forEach(function (el) {
        el.classList.remove('checked');
      });
      var dateInput = shadowRoot.getElementById('ea-date');
      if (dateInput) { dateInput.disabled = false; dateInput.style.opacity = '1'; }
      var previewsEl = shadowRoot.getElementById('ea-upload-previews');
      if (previewsEl) previewsEl.innerHTML = '';
      var labelEl = shadowRoot.getElementById('ea-upload-label');
      if (labelEl) labelEl.style.display = '';
      var areaEl = shadowRoot.getElementById('ea-upload-area');
      if (areaEl) areaEl.classList.remove('has-files');
    }

    overlay.style.display = 'flex';
    d.body.style.overflow  = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { overlay.classList.add('visible'); });
    });
  }

  function closeModal() {
    overlay.classList.remove('visible');
    d.body.style.overflow = '';
    var onEnd = function () {
      overlay.style.display = 'none';
      overlay.removeEventListener('transitionend', onEnd);
    };
    overlay.addEventListener('transitionend', onEnd);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INIT
  // ──────────────────────────────────────────────────────────────────────────
  function init() {
    d.querySelectorAll('[data-einfachanfrage]').forEach(function (btn) {
      btn.addEventListener('click', openModal);
    });

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (node.nodeType !== 1) return;
          if (node.hasAttribute && node.hasAttribute('data-einfachanfrage')) node.addEventListener('click', openModal);
          if (node.querySelectorAll) {
            node.querySelectorAll('[data-einfachanfrage]').forEach(function (btn) { btn.addEventListener('click', openModal); });
          }
        });
      });
    });
    observer.observe(d.body, { childList: true, subtree: true });

    w.einfachAnfrage = { open: openModal, close: closeModal };
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
