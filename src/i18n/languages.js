/**
 * Language registry for multilingual intent classification and Claude API responses.
 *
 * codeKeywords and techDomain are intentionally omitted per language — developers
 * universally write those in English regardless of their spoken language.
 *
 * Each entry provides:
 *   nlKeywords       — conversational/request words in that language
 *   hybridTriggers   — educational / doc-writing words
 *   creativeDomain   — creative writing vocabulary
 *   businessDomain   — business / commercial vocabulary
 *   scientificDomain — research / scientific vocabulary
 *   systemPromptPrefix — instruction injected at the top of every Claude system prompt
 *   useSubstringMatch  — true for CJK languages where the Latin tokenizer cannot
 *                        split continuous script into individual words
 */

export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    systemPromptPrefix: '',
    useSubstringMatch: false,
    nlKeywords: [],
    hybridTriggers: [],
    creativeDomain: [],
    businessDomain: [],
    scientificDomain: [],
  },

  fr: {
    name: 'French',
    systemPromptPrefix: 'Respond entirely in French.',
    useSubstringMatch: false,
    nlKeywords: [
      'écrire', 'expliquer', 'décrire', 'dire', 'montrer', 'aider', 'faire',
      'donner', 'lister', 'quoi', 'comment', 'pourquoi', 'quand', 'combien',
      'veuillez', 'pourriez', 'voudriez', 'devriez', 'besoin', 'vouloir', 'penser',
      'comprendre', 'résumer', 'analyser', 'discuter', 'comparer', 'suggérer',
      'intéressé', 'planifier', 'apprendre', 'étudier', 'chercher',
    ],
    hybridTriggers: [
      'tutoriel', 'guide', 'documentation', 'aperçu', 'introduction',
      'article', 'cours', 'leçon', 'exemples', 'exemple', 'rapport',
      'spécification', 'présentation', 'comparaison', 'explication',
      'implémentation', 'analyse', 'notes', 'document', 'différence',
    ],
    creativeDomain: [
      'histoire', 'poème', 'essai', 'blog', 'créatif', 'fiction', 'narratif',
      'personnage', 'intrigue', 'métaphore', 'ton', 'voix', 'roman', 'scénario',
      'paroles', 'prose', 'dialogue', 'genre', 'thème',
    ],
    businessDomain: [
      'stratégie', 'marketing', 'revenus', 'client', 'produit', 'marché',
      'entreprise', 'société', 'croissance', 'roi', 'ventes', 'proposition',
      'indicateurs', 'marque', 'startup', 'investisseur', 'budget', 'prévision',
      'acquisition', 'rétention', 'conversion',
    ],
    scientificDomain: [
      'recherche', 'hypothèse', 'expérience', 'méthodologie', 'résultats',
      'conclusion', 'statistique', 'scientifique', 'enquête', 'corrélation',
      'causalité', 'échantillon', 'population',
    ],
  },

  es: {
    name: 'Spanish',
    systemPromptPrefix: 'Respond entirely in Spanish.',
    useSubstringMatch: false,
    nlKeywords: [
      'escribir', 'explicar', 'describir', 'decir', 'mostrar', 'ayudar', 'hacer',
      'dar', 'listar', 'qué', 'cómo', 'cuándo', 'dónde', 'quién', 'cuál',
      'favor', 'podría', 'quisiera', 'debería', 'necesitar', 'querer', 'pensar',
      'entender', 'resumir', 'analizar', 'discutir', 'comparar', 'sugerir',
      'interesado', 'planificar', 'aprender', 'estudiar', 'buscar',
    ],
    hybridTriggers: [
      'tutorial', 'guía', 'documentación', 'introducción',
      'artículo', 'curso', 'lección', 'ejemplos', 'ejemplo', 'informe',
      'especificación', 'presentación', 'comparación', 'explicación',
      'implementación', 'análisis', 'notas', 'documento', 'diferencia',
    ],
    creativeDomain: [
      'historia', 'poema', 'ensayo', 'blog', 'creativo', 'ficción', 'narrativa',
      'personaje', 'trama', 'metáfora', 'tono', 'voz', 'novela', 'guión',
      'letras', 'prosa', 'diálogo', 'género', 'tema',
    ],
    businessDomain: [
      'estrategia', 'marketing', 'ingresos', 'cliente', 'producto', 'mercado',
      'negocio', 'empresa', 'crecimiento', 'roi', 'ventas', 'propuesta',
      'métricas', 'marca', 'startup', 'inversor', 'presupuesto', 'pronóstico',
      'adquisición', 'retención', 'conversión',
    ],
    scientificDomain: [
      'investigación', 'hipótesis', 'experimento', 'metodología', 'resultados',
      'conclusión', 'estadístico', 'científico', 'encuesta', 'correlación',
      'causalidad', 'muestra', 'población',
    ],
  },

  it: {
    name: 'Italian',
    systemPromptPrefix: 'Respond entirely in Italian.',
    useSubstringMatch: false,
    nlKeywords: [
      'scrivere', 'spiegare', 'descrivere', 'dire', 'mostrare', 'aiutare', 'fare',
      'dare', 'elencare', 'cosa', 'come', 'perché', 'quando', 'dove', 'quale',
      'favore', 'potrebbe', 'vorrei', 'dovrebbe', 'bisogno', 'volere', 'pensare',
      'capire', 'riassumere', 'analizzare', 'discutere', 'confrontare', 'suggerire',
      'interessato', 'pianificare', 'imparare', 'studiare', 'cercare',
    ],
    hybridTriggers: [
      'tutorial', 'guida', 'documentazione', 'panoramica', 'introduzione',
      'articolo', 'corso', 'lezione', 'esempi', 'esempio', 'rapporto',
      'specifica', 'presentazione', 'confronto', 'spiegazione',
      'implementazione', 'analisi', 'note', 'documento', 'differenza',
    ],
    creativeDomain: [
      'storia', 'poesia', 'saggio', 'blog', 'creativo', 'fiction', 'narrativa',
      'personaggio', 'trama', 'metafora', 'tono', 'voce', 'romanzo', 'sceneggiatura',
      'testo', 'prosa', 'dialogo', 'genere', 'tema',
    ],
    businessDomain: [
      'strategia', 'marketing', 'ricavi', 'cliente', 'prodotto', 'mercato',
      'azienda', 'società', 'crescita', 'roi', 'vendite', 'proposta',
      'metriche', 'brand', 'startup', 'investitore', 'budget', 'previsione',
      'acquisizione', 'fidelizzazione', 'conversione',
    ],
    scientificDomain: [
      'ricerca', 'ipotesi', 'esperimento', 'metodologia', 'risultati',
      'conclusione', 'statistico', 'scientifico', 'indagine', 'correlazione',
      'causalità', 'campione', 'popolazione',
    ],
  },

  pt: {
    name: 'Portuguese',
    systemPromptPrefix: 'Respond entirely in Portuguese.',
    useSubstringMatch: false,
    nlKeywords: [
      'escrever', 'explicar', 'descrever', 'dizer', 'mostrar', 'ajudar', 'fazer',
      'dar', 'listar', 'como', 'quando', 'onde', 'quem', 'qual',
      'favor', 'poderia', 'gostaria', 'deveria', 'precisar', 'querer', 'pensar',
      'entender', 'resumir', 'analisar', 'discutir', 'comparar', 'sugerir',
      'interessado', 'planejar', 'aprender', 'estudar', 'procurar',
    ],
    hybridTriggers: [
      'tutorial', 'guia', 'documentação', 'introdução',
      'artigo', 'curso', 'lição', 'exemplos', 'exemplo', 'relatório',
      'especificação', 'apresentação', 'comparação', 'explicação',
      'implementação', 'análise', 'notas', 'documento', 'diferença',
    ],
    creativeDomain: [
      'história', 'poema', 'ensaio', 'blog', 'criativo', 'ficção', 'narrativa',
      'personagem', 'trama', 'metáfora', 'tom', 'voz', 'romance', 'roteiro',
      'letra', 'prosa', 'diálogo', 'gênero', 'tema',
    ],
    businessDomain: [
      'estratégia', 'marketing', 'receita', 'cliente', 'produto', 'mercado',
      'negócio', 'empresa', 'crescimento', 'roi', 'vendas', 'proposta',
      'métricas', 'marca', 'startup', 'investidor', 'orçamento', 'previsão',
      'aquisição', 'retenção', 'conversão',
    ],
    scientificDomain: [
      'pesquisa', 'hipótese', 'experimento', 'metodologia', 'resultados',
      'conclusão', 'estatístico', 'científico', 'correlação',
      'causalidade', 'amostra', 'população',
    ],
  },

  de: {
    name: 'German',
    systemPromptPrefix: 'Respond entirely in German.',
    useSubstringMatch: false,
    nlKeywords: [
      'schreiben', 'erklären', 'beschreiben', 'sagen', 'zeigen', 'helfen', 'machen',
      'geben', 'auflisten', 'was', 'wie', 'warum', 'wann', 'welche',
      'bitte', 'könnten', 'würden', 'sollten', 'brauchen', 'wollen', 'denken',
      'verstehen', 'zusammenfassen', 'analysieren', 'diskutieren', 'vergleichen', 'vorschlagen',
      'interessiert', 'planen', 'lernen', 'studieren', 'suchen',
    ],
    hybridTriggers: [
      'tutorial', 'leitfaden', 'dokumentation', 'überblick', 'einführung',
      'artikel', 'kurs', 'lektion', 'beispiele', 'beispiel', 'bericht',
      'spezifikation', 'präsentation', 'vergleich', 'erklärung',
      'implementierung', 'analyse', 'notizen', 'dokument', 'unterschied',
    ],
    creativeDomain: [
      'geschichte', 'gedicht', 'aufsatz', 'blog', 'kreativ', 'fiktion', 'erzählung',
      'charakter', 'handlung', 'metapher', 'ton', 'stimme', 'roman', 'drehbuch',
      'liedtext', 'prosa', 'dialog', 'genre', 'thema',
    ],
    businessDomain: [
      'strategie', 'marketing', 'einnahmen', 'kunde', 'produkt', 'markt',
      'unternehmen', 'gesellschaft', 'wachstum', 'roi', 'vertrieb', 'vorschlag',
      'kennzahlen', 'marke', 'startup', 'investor', 'budget', 'prognose',
      'akquisition', 'bindung', 'konversion',
    ],
    scientificDomain: [
      'forschung', 'hypothese', 'experiment', 'methodik', 'ergebnisse',
      'schlussfolgerung', 'statistisch', 'wissenschaftlich', 'umfrage', 'korrelation',
      'kausalität', 'stichprobe', 'bevölkerung',
    ],
  },

  ar: {
    name: 'Arabic',
    systemPromptPrefix: 'Respond entirely in Arabic.',
    useSubstringMatch: false,
    nlKeywords: [
      'اكتب', 'اشرح', 'صف', 'أظهر', 'ساعد', 'افعل',
      'أعط', 'كيف', 'لماذا', 'متى', 'أين', 'من',
      'فضلك', 'يمكن', 'أريد', 'أحتاج', 'أعتقد',
      'أفهم', 'لخص', 'حلل', 'ناقش', 'قارن', 'اقترح',
      'مهتم', 'خطط', 'تعلم', 'ادرس', 'ابحث',
    ],
    hybridTriggers: [
      'درس', 'دليل', 'توثيق', 'مقدمة',
      'مقالة', 'دورة', 'أمثلة', 'مثال', 'تقرير',
      'مواصفات', 'عرض', 'مقارنة', 'شرح',
      'تطبيق', 'تحليل', 'ملاحظات', 'وثيقة',
    ],
    creativeDomain: [
      'قصة', 'قصيدة', 'مقال', 'مدونة', 'إبداعي', 'خيال', 'سرد',
      'شخصية', 'حبكة', 'استعارة', 'رواية', 'سيناريو',
      'نثر', 'حوار', 'موضوع',
    ],
    businessDomain: [
      'استراتيجية', 'تسويق', 'إيرادات', 'عميل', 'منتج', 'سوق',
      'أعمال', 'شركة', 'نمو', 'مبيعات', 'اقتراح',
      'مقاييس', 'علامة', 'ميزانية', 'توقع',
      'اكتساب', 'احتفاظ', 'تحويل',
    ],
    scientificDomain: [
      'بحث', 'فرضية', 'تجربة', 'منهجية', 'نتائج',
      'استنتاج', 'إحصائي', 'علمي', 'استطلاع', 'ارتباط',
      'سببية', 'عينة',
    ],
  },

  zh: {
    name: 'Chinese (Simplified)',
    systemPromptPrefix: 'Respond entirely in Chinese (Simplified).',
    // CJK text has no word-boundary separators — use substring matching
    useSubstringMatch: true,
    nlKeywords: [
      '写', '解释', '描述', '告诉', '展示', '帮助', '做',
      '给', '列出', '什么', '如何', '为什么', '何时', '哪里', '谁',
      '请', '需要', '想要', '应该', '认为',
      '理解', '总结', '分析', '讨论', '比较', '建议',
      '感兴趣', '计划', '学习', '研究', '寻找',
    ],
    hybridTriggers: [
      '教程', '指南', '文档', '概述', '介绍',
      '文章', '课程', '例子', '报告',
      '规范', '演示', '比较', '解释',
      '实现', '分析', '笔记', '文件', '差异',
    ],
    creativeDomain: [
      '故事', '诗歌', '文章', '博客', '创意', '小说', '叙述',
      '角色', '情节', '比喻', '语气', '剧本',
      '歌词', '散文', '对话', '主题',
    ],
    businessDomain: [
      '战略', '营销', '收入', '客户', '产品', '市场',
      '业务', '公司', '增长', '销售', '提案',
      '指标', '品牌', '创业', '投资者',
      '预算', '预测', '获客', '留存', '转化',
    ],
    scientificDomain: [
      '研究', '假设', '实验', '方法论', '结果',
      '结论', '统计', '科学', '调查', '相关',
      '因果', '样本', '群体',
    ],
  },

  ja: {
    name: 'Japanese',
    systemPromptPrefix: 'Respond entirely in Japanese.',
    // CJK text has no word-boundary separators — use substring matching
    useSubstringMatch: true,
    nlKeywords: [
      '書く', '説明', '描写', '教える', '見せる', '助ける', '作る',
      '与える', '何', 'どのように', 'なぜ', 'いつ', 'どこ', '誰',
      'お願い', '必要', '思う',
      '理解', '要約', '分析', '議論', '比較', '提案',
      '興味', '計画', '学ぶ', '勉強', '探す',
    ],
    hybridTriggers: [
      'チュートリアル', 'ガイド', 'ドキュメント', '概要', '紹介',
      '記事', 'コース', 'レッスン', '例', 'レポート',
      '仕様', 'プレゼンテーション', '比較', '説明',
      '実装', '分析', 'メモ', '文書',
    ],
    creativeDomain: [
      '物語', '詩', 'エッセイ', 'ブログ', 'クリエイティブ', '小説',
      'キャラクター', 'プロット', '比喩', 'トーン', 'シナリオ',
      '散文', 'ダイアログ', 'テーマ',
    ],
    businessDomain: [
      '戦略', 'マーケティング', '収益', '顧客', '製品', '市場',
      'ビジネス', '会社', '成長', '売上', '提案',
      '指標', 'ブランド', 'スタートアップ', '投資家',
      '予算', '予測', '獲得', '維持',
    ],
    scientificDomain: [
      '研究', '仮説', '実験', '方法論', '結果',
      '結論', '統計的', '科学的', '調査', '相関',
      '因果関係', 'サンプル',
    ],
  },
};

export const DEFAULT_LANGUAGE = 'en';

/** Returns the language config for a given code, falling back to English. */
export function getLanguage(code) {
  return SUPPORTED_LANGUAGES[code] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

/** Returns true if the language code is supported. */
export function isSupported(code) {
  return Object.prototype.hasOwnProperty.call(SUPPORTED_LANGUAGES, code);
}
