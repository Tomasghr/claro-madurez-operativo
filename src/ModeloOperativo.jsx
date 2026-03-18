import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// ─── DIMENSIONES DEL MODELO OPERATIVO ─────────────────────────────────────────
const DIMS = [
  {
    key: "talento", label: "Talento y Capacidades", num: "01", icon: "👥",
    sub: "Capacidades organizacionales, aprendizaje, talento y conocimiento",
    subs: [
      {
        id: "t1", label: "Capacidades organizacionales", desc: "Definición y gestión de capacidades estratégicas",
        q: "Evalúe el nivel de madurez en Capacidades organizacionales",
        ndesc: [
          "Las capacidades críticas para ejecutar la estrategia no están definidas de manera explícita ni existe un lenguaje común sobre qué capacidades deben fortalecerse, preservarse o construirse. La organización opera desde funciones y cargos aislados, con prioridades reactivas y sin una visión clara de qué capacidades diferencian a Claro frente al mercado.",
          "Se reconocen algunas capacidades relevantes para el negocio y existen discusiones iniciales sobre prioridades futuras, pero la definición sigue siendo parcial, heterogénea y dependiente de cada área. Las capacidades no se traducen de forma consistente en decisiones de organización, inversión, talento o tecnología.",
          "Existe una definición formal de capacidades estratégicas y habilitadoras, alineada con la estrategia y entendida por los líderes principales. Las capacidades se usan para orientar decisiones sobre estructura, procesos, perfiles, tecnología y prioridades de transformación.",
          "La compañía gestiona un mapa integral de capacidades, actualizado periódicamente y conectado con estrategia, modelo operativo, inversiones y desempeño. Las capacidades se miden, se comparan contra benchmark externo y se desarrollan dinámicamente para sostener ventajas competitivas.",
        ],
        opp: "Mapa integral de capacidades, actualizado y conectado con estrategia, inversiones y desempeño; benchmark externo continuo.",
      },
      {
        id: "t2", label: "Aprendizaje y Desarrollo", desc: "Arquitectura de formación alineada a capacidades prioritarias",
        q: "Evalúe el nivel de madurez en Aprendizaje y Desarrollo",
        ndesc: [
          "La formación ocurre de forma aislada, reactiva y principalmente para resolver necesidades inmediatas. No existe una arquitectura de aprendizaje, una priorización por capacidades críticas ni mecanismos sistemáticos para verificar si el entrenamiento genera adopción o mejora del desempeño.",
          "Hay iniciativas de capacitación y algunos programas definidos, pero su cobertura, contenido y seguimiento varían por área. La oferta formativa responde parcialmente a necesidades del negocio, sin una conexión robusta con prioridades estratégicas, rutas de carrera o cambios en el modelo operativo.",
          "La organización cuenta con una agenda estructurada de aprendizaje alineada a capacidades prioritarias, roles críticos y necesidades de transformación. Existen currículos, mecanismos de seguimiento y evaluación de adopción.",
          "El aprendizaje es continuo, diferenciado por segmento de talento y estrechamente vinculado a la estrategia y al cambio organizacional. La compañía usa datos de desempeño para anticipar necesidades de reskilling/upskilling, medir impacto real y acelerar la adopción del modelo operativo futuro.",
        ],
        opp: "Aprendizaje continuo, diferenciado por segmento, con datos para anticipar reskilling/upskilling y medir impacto real.",
      },
      {
        id: "t3", label: "Gestión del talento", desc: "Ciclo integral de atracción, desarrollo, sucesión y retención",
        q: "Evalúe el nivel de madurez en Gestión del talento",
        ndesc: [
          "La gestión del talento es predominantemente administrativa y transaccional, con procesos fragmentados a lo largo del ciclo de vida del empleado. Atracción, evaluación, desarrollo, sucesión y retención se gestionan sin una lógica integrada ni foco en roles o capacidades críticas.",
          "Existen procesos básicos de talento y algunos criterios comunes de desempeño, promoción o sucesión, pero no están integrados ni orientados sistemáticamente a las prioridades estratégicas. La toma de decisiones sigue siendo mayormente reactiva y con visibilidad limitada de riesgos de talento.",
          "La organización gestiona el talento de forma integral, con procesos relativamente consistentes de atracción, desempeño, sucesión, movilidad y retención. Se identifican roles críticos y riesgos de talento conectados con las necesidades del negocio.",
          "La gestión del talento es estratégica, data-driven y orientada a capacidades futuras. La compañía anticipa brechas, moviliza talento con agilidad, fortalece banca de sucesión y adapta propuestas de desarrollo y retención por segmento crítico.",
        ],
        opp: "Gestión del talento estratégica y data-driven; anticipación de brechas, movilidad ágil y banca de sucesión robusta.",
      },
      {
        id: "t4", label: "Propuesta de valor al empleado (EVP)", desc: "Propuesta diferenciada para atraer y retener talento clave",
        q: "Evalúe el nivel de madurez en Propuesta de valor al empleado (EVP)",
        ndesc: [
          "No existe una propuesta de valor al empleado claramente articulada o diferenciada. La experiencia del colaborador depende de prácticas heredadas, mensajes dispersos y atributos genéricos, lo que dificulta atraer y retener talento clave en un entorno competitivo.",
          "La organización ha definido algunos elementos aspiracionales de su EVP y comunica mensajes sobre cultura, desarrollo o beneficios, pero sin una narrativa integrada ni una promesa distintiva por segmentos de talento. La experiencia real del empleado es inconsistente frente a lo que se comunica.",
          "Existe una EVP clara, comunicada y razonablemente alineada con cultura, desarrollo, experiencia y prioridades del negocio. La propuesta ayuda a atraer y retener perfiles relevantes.",
          "La EVP es distintiva, creíble y activamente gestionada como palanca estratégica. Está segmentada para talento crítico, conectada con propósito, cultura, liderazgo, desarrollo y flexibilidad, y se monitorea con indicadores concretos de atracción, compromiso y retención.",
        ],
        opp: "EVP distintiva, segmentada para talento crítico, monitoreada con indicadores de atracción, compromiso y retención.",
      },
      {
        id: "t5", label: "Gestión del conocimiento", desc: "Captura, preservación y reutilización del conocimiento crítico",
        q: "Evalúe el nivel de madurez en Gestión del conocimiento",
        ndesc: [
          "El conocimiento crítico reside principalmente en personas o equipos específicos y se transfiere de manera informal. No hay prácticas sistemáticas para documentar, preservar, difundir o reutilizar aprendizajes, generando dependencia y riesgo operativo.",
          "Se han documentado ciertos procesos, lecciones aprendidas o repositorios, pero la gestión del conocimiento sigue siendo parcial y con bajo uso transversal. La transferencia depende del esfuerzo individual o de iniciativas puntuales, sin estándares comunes ni incentivos claros.",
          "La organización cuenta con mecanismos definidos para capturar y compartir conocimiento relevante, especialmente en procesos, proyectos y capacidades críticas. Existen repositorios, prácticas de handover y comunidades de aprendizaje.",
          "La gestión del conocimiento está integrada a la operación y al desarrollo de capacidades. El conocimiento crítico se captura, curaduría y reutiliza de manera sistemática, habilitando continuidad, rapidez de escalamiento y aprendizaje organizacional sostenido.",
        ],
        opp: "Conocimiento crítico capturado, curado y reutilizado sistemáticamente; continuidad y menor dependencia de individuos.",
      },
      {
        id: "t6", label: "Planificación estratégica de workforce", desc: "Proyección de necesidades futuras de talento y capacidades",
        q: "Evalúe el nivel de madurez en Planificación estratégica de workforce",
        ndesc: [
          "La planificación de talento responde a necesidades de corto plazo y vacantes inmediatas, sin una visión estructurada de demanda futura ni de capacidades requeridas. No existe un enfoque formal para anticipar brechas o riesgos del workforce mix.",
          "Se realizan ejercicios parciales de planeación de talento, normalmente ligados a presupuesto o iniciativas específicas, pero con horizonte limitado y poca integración con estrategia, automatización o transformación tecnológica.",
          "Existe un proceso formal para proyectar necesidades futuras de talento y capacidades, incorporando prioridades estratégicas, demanda esperada y algunas hipótesis de productividad. La planeación informa decisiones de contratación, formación o movilidad.",
          "La compañía cuenta con una planeación estratégica de fuerza laboral orientada a escenarios, integrada con estrategia, tecnología y modelo operativo. Anticipa brechas de capacidades y permite decisiones proactivas sobre build, buy, borrow o partner.",
        ],
        opp: "Planeación de workforce orientada a escenarios, integrada con estrategia y tecnología; decisiones proactivas de build/buy/borrow.",
      },
    ],
  },
  {
    key: "organizacion", label: "Organización y Gobernanza", num: "02", icon: "🏗️",
    sub: "Estructura, roles, jerarquías y toma de decisiones",
    subs: [
      {
        id: "o1", label: "Estructura organizacional", desc: "Lógica de diseño estructural orientada a creación de valor",
        q: "Evalúe el nivel de madurez en Estructura organizacional",
        ndesc: [
          "La estructura responde más a historia, personas o urgencias que a una lógica clara de creación de valor. Existen solapamientos, fragmentación y dificultades para coordinar capacidades transversales, lo que limita velocidad, accountability y escalabilidad.",
          "Se han realizado ajustes parciales a la estructura y se reconoce la necesidad de evolucionarla, pero persisten inconsistencias en criterios de diseño, duplicidades y tensiones entre centralización y autonomía.",
          "La estructura está diseñada con criterios explícitos y relativamente alineada a capacidades, prioridades del negocio y necesidades de coordinación. Facilita mejor la claridad de mandatos y la interacción entre áreas.",
          "La estructura es clara, adaptable y orientada a valor, con criterios de diseño explícitos, revisiones periódicas y capacidad de evolucionar con rapidez frente a cambios estratégicos. Balancea centralización, autonomía, eficiencia y cercanía al negocio.",
        ],
        opp: "Estructura clara, adaptable y orientada a valor; criterios de diseño explícitos y revisiones periódicas frente a cambios estratégicos.",
      },
      {
        id: "o2", label: "Roles y responsabilidades", desc: "Claridad de mandatos, accountability e interfaces",
        q: "Evalúe el nivel de madurez en Roles y responsabilidades",
        ndesc: [
          "Los roles y responsabilidades no están claramente definidos o no son entendidos de forma consistente. Hay zonas grises, trabajo duplicado, escalaciones innecesarias y dependencias excesivas de personas clave para destrabar decisiones.",
          "Existen descripciones o definiciones parciales de responsabilidades, pero con diferencias entre áreas, múltiples interpretaciones y solapamientos en puntos críticos.",
          "La mayoría de roles clave tiene mandatos y responsabilidades claramente definidos, lo que permite un nivel adecuado de accountability y coordinación. Persisten algunos vacíos en interfaces críticas o procesos transversales.",
          "Los roles están diseñados con claridad de propósito, accountability, interfaces y decisión, y se actualizan conforme evoluciona el modelo operativo. La organización minimiza ambigüedades y refuerza ownership de forma consistente.",
        ],
        opp: "Roles con claridad de propósito, accountability e interfaces; actualizados conforme evoluciona el modelo operativo.",
      },
      {
        id: "o3", label: "Jerarquías y spans de control", desc: "Capas jerárquicas y spans definidos con criterios explícitos",
        q: "Evalúe el nivel de madurez en Jerarquías y spans de control",
        ndesc: [
          "La organización presenta capas jerárquicas y spans de control definidos de forma poco deliberada, con señales de complejidad, supervisión excesiva o estructuras desbalanceadas que ralentizan decisiones y diluyen accountability.",
          "Existen análisis o discusiones sobre capas y spans, pero las decisiones aún son parciales y no siguen criterios homogéneos. Algunas áreas muestran avances mientras otras mantienen estructuras sobredimensionadas.",
          "La organización aplica criterios relativamente claros para definir niveles jerárquicos y spans de control, diferenciando según tipo de trabajo y necesidades de gestión. Soporta razonablemente la velocidad de decisión.",
          "Las jerarquías y spans están optimizados con criterios explícitos de valor, velocidad, control y desarrollo de líderes. Combina eficiencia estructural con empowerment, minimiza burocracia y revisa periódicamente frente a benchmark.",
        ],
        opp: "Jerarquías y spans optimizados con criterios explícitos; eficiencia estructural con empowerment y revisión periódica.",
      },
      {
        id: "o4", label: "Gobernanza y decision rights", desc: "Foros, umbrales y autoridades para decidir con rapidez",
        q: "Evalúe el nivel de madurez en Gobernanza y decision rights",
        ndesc: [
          "La gobernanza es poco clara, excesivamente informal o demasiado centralizada; no se distinguen con precisión los foros, umbrales y autoridades para decidir. Las decisiones se retrasan, duplican o escalan innecesariamente.",
          "Existen algunos comités, matrices o mecanismos de decisión, pero con cobertura parcial, superposiciones y diferente madurez entre áreas. Persisten ambigüedades sobre quién decide, quién recomienda y quién ejecuta.",
          "La compañía cuenta con una gobernanza formal para decisiones relevantes, con foros, umbrales y roles relativamente bien definidos. La toma de decisiones es más coherente y trazable.",
          "La gobernanza habilita decisiones rápidas, claras y consistentes, con asignación explícita de decision rights, mecanismos de escalamiento y trazabilidad. Los foros están racionalizados, se revisan por efectividad y equilibran empowerment, control y agilidad.",
        ],
        opp: "Gobernanza que habilita decisiones rápidas con decision rights explícitos, foros racionalizados y equilibrio entre empowerment y control.",
      },
    ],
  },
  {
    key: "liderazgo", label: "Liderazgo y Cultura", num: "03", icon: "🌟",
    sub: "Valores, cultura, DEI, formas de trabajo y excelencia del liderazgo",
    subs: [
      {
        id: "l1", label: "Valores y comportamientos", desc: "Valores traducidos en comportamientos observables y consistentes",
        q: "Evalúe el nivel de madurez en Valores y comportamientos",
        ndesc: [
          "Los valores corporativos no están claramente definidos, no son conocidos o no se traducen en comportamientos observables. Las decisiones cotidianas responden más a hábitos individuales o incentivos implícitos que a principios compartidos.",
          "La organización ha definido valores o principios aspiracionales, pero estos todavía no guían de forma consistente las decisiones, prioridades y comportamientos. Existen mensajes y campañas sin suficiente conexión con liderazgo o procesos de gestión.",
          "Los valores están definidos y traducidos en comportamientos esperados para líderes y equipos, con un nivel razonable de apropiación. Se utilizan en algunos procesos de gestión (desempeño, liderazgo, reconocimiento).",
          "Los valores y comportamientos son un referente real para la toma de decisiones, la colaboración y la ejecución. Están incorporados en liderazgo, incentivos, desarrollo, reconocimiento y gestión del desempeño.",
        ],
        opp: "Valores y comportamientos como referente real para decisiones; incorporados en incentivos, desarrollo, reconocimiento y gestión del desempeño.",
      },
      {
        id: "l2", label: "Cultura corporativa", desc: "Gestión deliberada de la cultura actual y deseada",
        q: "Evalúe el nivel de madurez en Cultura corporativa",
        ndesc: [
          "La cultura actual no está explicitada ni gestionada deliberadamente; predomina una lógica implícita de 'así se hacen las cosas'. Hay baja alineación entre áreas y distancia significativa entre la cultura requerida por la estrategia y la cultura vivida.",
          "Existe una visión aspiracional de cultura o se han identificado algunos rasgos deseados, pero la comprensión de la cultura actual y sus brechas es parcial. La organización reconoce la necesidad de cambio cultural sin mecanismos sólidos para movilizarlo.",
          "La cultura actual y la deseada están razonablemente diagnosticadas y existe una agenda clara para reforzar atributos clave. Hay iniciativas, símbolos y mecanismos que empiezan a alinear comportamientos con la estrategia.",
          "La cultura se gestiona como un activo estratégico. La organización combina propósito, valores, comportamientos y mecanismos formales e informales para reforzar la cultura requerida, medir su evolución y sostener cambios en el tiempo.",
        ],
        opp: "Cultura gestionada como activo estratégico; mecanismos formales e informales para reforzarla, medirla y sostener cambios.",
      },
      {
        id: "l3", label: "Diversidad, equidad e inclusión (DEI)", desc: "Integración de DEI en procesos de talento, liderazgo y cultura",
        q: "Evalúe el nivel de madurez en Diversidad, equidad e inclusión (DEI)",
        ndesc: [
          "La DEI no forma parte de la agenda organizacional de manera explícita o se limita al cumplimiento básico. No existen lineamientos, prácticas ni métricas relevantes para garantizar equidad de oportunidades, diversidad e inclusión cotidiana.",
          "Se han definido mensajes, iniciativas o políticas puntuales de DEI, pero su alcance es limitado y no están plenamente integrados a procesos de talento, liderazgo o cultura.",
          "La compañía cuenta con lineamientos y prácticas de DEI incorporadas en procesos clave de talento y cultura. Se monitorean algunos indicadores y existe conciencia creciente sobre sesgos, inclusión y representatividad.",
          "La DEI está integrada al modelo de liderazgo, talento y cultura, con objetivos claros, métricas, accountability y acciones sostenidas. Crea un entorno de pertenencia y equidad que amplía diversidad de pensamiento y mejora la toma de decisiones.",
        ],
        opp: "DEI integrada con objetivos, métricas y accountability; entorno de pertenencia que amplía diversidad de pensamiento.",
      },
      {
        id: "l4", label: "Ways of working", desc: "Formas de trabajo para velocidad, foco y colaboración",
        q: "Evalúe el nivel de madurez en Ways of working",
        ndesc: [
          "Las formas de trabajo están dominadas por silos, alta dependencia de jerarquía, coordinación informal y baja disciplina transversal. La colaboración entre áreas depende más de relaciones personales que de rutinas y prácticas organizacionales claras.",
          "Se han introducido algunas prácticas colaborativas o ágiles, pero su adopción es desigual y convive con hábitos tradicionales que frenan velocidad y coordinación. Existen avances puntuales sin un modelo común de trabajo ampliamente adoptado.",
          "La organización ha definido y desplegado formas de trabajo relativamente consistentes para coordinación, priorización, resolución de problemas y ejecución transversal.",
          "Los ways of working están diseñados deliberadamente para maximizar velocidad, foco y colaboración. La organización cuenta con rutinas, cadencias, roles y herramientas consistentes que facilitan priorización, trabajo transversal y escalamiento eficiente.",
        ],
        opp: "Ways of working diseñados para maximizar velocidad y colaboración; rutinas, cadencias y herramientas consistentes.",
      },
      {
        id: "l5", label: "Excelencia del liderazgo", desc: "Capacidad del liderazgo para alinear, movilizar y transformar",
        q: "Evalúe el nivel de madurez en Excelencia del liderazgo",
        ndesc: [
          "El liderazgo es predominantemente reactivo, funcional y centrado en la operación del día a día. Hay baja alineación en prioridades, mensajes y comportamientos, y los líderes no siempre modelan la cultura ni movilizan el cambio requerido.",
          "La organización reconoce la importancia del liderazgo y ha desarrollado algunas prácticas o expectativas comunes, pero la efectividad sigue siendo heterogénea. La capacidad de liderar transformaciones depende más de perfiles individuales que de un sistema de liderazgo.",
          "Existe un marco relativamente claro de liderazgo esperado, reforzado a través de evaluación, desarrollo y algunas intervenciones específicas. Los líderes muestran mayor alineación estratégica y capacidad de movilizar equipos.",
          "El liderazgo es una fortaleza distintiva de la organización: alinea dirección, moviliza cambio, desarrolla talento y sostiene resultados. Existen estándares, desarrollo continuo, feedback y accountability que aseguran coherencia cultural y capacidad de transformación a escala.",
        ],
        opp: "Liderazgo como fortaleza distintiva: estándares, desarrollo continuo, feedback y accountability que aseguran transformación a escala.",
      },
    ],
  },
  {
    key: "procesos", label: "Procesos", num: "04", icon: "⚙️",
    sub: "Diseño end-to-end, métricas, interfaces, automatización y mejora continua",
    subs: [
      {
        id: "p1", label: "Diseño end-to-end de procesos", desc: "Visión integral del flujo de extremo a extremo",
        q: "Evalúe el nivel de madurez en Diseño end-to-end de procesos",
        ndesc: [
          "Los procesos están definidos principalmente desde la lógica de funciones o áreas, con múltiples handoffs, redundancias y puntos ciegos en la experiencia del usuario interno o cliente final. No existe una visión clara del flujo end-to-end.",
          "Se han mapeado o mejorado algunos procesos críticos, pero el enfoque end-to-end sigue siendo parcial. Persisten fragmentación, reprocesos y falta de claridad en interfaces, especialmente en procesos transversales.",
          "Los procesos clave están definidos de extremo a extremo, con una comprensión razonable de entradas, salidas, roles e interdependencias. Permite mejor coordinación y visibilidad.",
          "La organización diseña y gestiona procesos desde la perspectiva end-to-end, con foco en cliente, valor, simplicidad y escalabilidad. Los procesos se revisan de forma sistemática y permiten una ejecución consistente a lo largo de la cadena.",
        ],
        opp: "Procesos gestionados end-to-end con foco en cliente, valor y simplicidad; revisión sistemática y ejecución consistente.",
      },
      {
        id: "p2", label: "Desempeño y métricas de procesos", desc: "KPIs end-to-end conectados con estrategia y experiencia",
        q: "Evalúe el nivel de madurez en Desempeño y métricas de procesos",
        ndesc: [
          "El desempeño de los procesos no se mide de manera estructurada o se monitorea con indicadores aislados, mayormente operativos y poco accionables. La organización tiene visibilidad limitada sobre tiempos, calidad o valor generado.",
          "Existen KPIs para algunos procesos o áreas, pero no siempre reflejan la lógica end-to-end ni están ligados a la toma de decisiones. Los datos pueden ser incompletos o inconsistentes.",
          "La mayoría de procesos críticos cuenta con métricas relevantes de desempeño, calidad, tiempos y cumplimiento, que se revisan con cierta regularidad. Los indicadores ayudan a gestionar el proceso.",
          "La organización gestiona sus procesos con métricas end-to-end conectadas con estrategia, experiencia, eficiencia y riesgo. Los KPIs son confiables, accionables y usados para priorizar mejoras y anticipar desvíos.",
        ],
        opp: "Métricas end-to-end confiables y accionables, conectadas con estrategia; usadas para priorizar mejoras y anticipar desvíos.",
      },
      {
        id: "p3", label: "Interfaces y SLAs", desc: "Acuerdos de servicio y mecanismos entre áreas",
        q: "Evalúe el nivel de madurez en Interfaces y SLAs",
        ndesc: [
          "Las interfaces entre áreas son ambiguas y se gestionan de forma informal, generando fricciones, retrabajos y expectativas no alineadas. No existen acuerdos claros sobre tiempos de respuesta, entregables o niveles de servicio.",
          "Algunas interfaces cuentan con acuerdos o definiciones básicas, pero su cobertura es parcial y su cumplimiento poco monitoreado. Las relaciones entre áreas dependen de la negociación caso a caso.",
          "Las interfaces críticas están definidas con responsabilidades y niveles de servicio razonablemente claros. Existen mecanismos de seguimiento y resolución de desvíos.",
          "La organización gestiona interfaces y niveles de servicio de forma estructurada, simple y orientada a valor. Los acuerdos son claros, medidos y revisados periódicamente, reduciendo fricciones y mejorando accountability.",
        ],
        opp: "Interfaces y SLAs estructurados, medidos y revisados periódicamente; reducen fricciones y mejoran accountability entre áreas.",
      },
      {
        id: "p4", label: "Automatización e inteligencia artificial", desc: "Uso de automatización e IA para mejorar calidad, velocidad y costo",
        q: "Evalúe el nivel de madurez en Automatización e inteligencia artificial",
        ndesc: [
          "Los procesos dependen principalmente de tareas manuales, validaciones repetitivas y manejo operativo por personas. El uso de automatización o IA es inexistente, incipiente o desconectado de una visión clara sobre dónde capturar valor.",
          "Se han implementado automatizaciones puntuales o pilotos de analítica/IA, pero sin escalamiento, priorización robusta ni rediseño integral del proceso. Los casos de uso mejoran tareas específicas sin transformar la forma de operar.",
          "La organización ha automatizado partes relevantes de procesos prioritarios y evalúa de forma más estructurada oportunidades de digitalización e IA. Existe una lógica de priorización y algunos beneficios tangibles.",
          "La automatización y la IA se integran deliberadamente en el diseño de procesos para mejorar calidad, velocidad, costo y experiencia. La organización prioriza casos de uso con criterio de valor, los escala de forma sostenible y cuenta con gobierno para monitorear impacto.",
        ],
        opp: "Automatización e IA integradas en el diseño de procesos; priorización por valor, escalamiento sostenible y gobierno de impacto.",
      },
      {
        id: "p5", label: "Mejora continua", desc: "Cultura y mecanismos institucionales de mejora de procesos",
        q: "Evalúe el nivel de madurez en Mejora continua",
        ndesc: [
          "La mejora de procesos ocurre de manera esporádica y reactiva, normalmente frente a problemas urgentes o iniciativas aisladas. No existe una disciplina sostenida, un backlog priorizado ni rutinas para identificar, ejecutar y sostener mejoras.",
          "Se realizan ejercicios puntuales de mejora y algunas áreas muestran disciplina básica para resolver problemas o capturar lecciones aprendidas. Sin embargo, la mejora continua no está institucionalizada.",
          "La organización cuenta con mecanismos definidos para identificar oportunidades, priorizar iniciativas y hacer seguimiento a mejoras en procesos relevantes. Existen responsables, rutinas y herramientas.",
          "La mejora continua es parte del ADN operativo: se apoya en datos, ownership claro y una cultura de resolución sistemática de problemas. Las oportunidades se identifican, priorizan e implementan con velocidad y los beneficios se sostienen.",
        ],
        opp: "Mejora continua como ADN operativo: datos, ownership claro y cultura de resolución sistemática de problemas.",
      },
    ],
  },
  {
    key: "tecnologia", label: "Tecnología y Datos", num: "05", icon: "💻",
    sub: "Arquitectura tecnológica, sistemas, datos y analítica avanzada",
    subs: [
      {
        id: "td1", label: "Arquitectura tecnológica", desc: "Visión de arquitectura objetivo con criterios de integración y escalabilidad",
        q: "Evalúe el nivel de madurez en Arquitectura tecnológica",
        ndesc: [
          "La arquitectura tecnológica ha crecido de manera fragmentada, con decisiones locales, baja estandarización y múltiples dependencias difíciles de gestionar. La organización carece de una visión clara de arquitectura objetivo.",
          "Existe una visión parcial de arquitectura y algunos principios de integración o estandarización, pero su aplicación es desigual. Persisten soluciones redundantes, debt tecnológico y dificultad para balancear necesidades del negocio con consistencia arquitectónica.",
          "La organización cuenta con una arquitectura tecnológica definida para dominios relevantes, con principios razonablemente claros de integración, modularidad y escalabilidad.",
          "La arquitectura tecnológica es modular, escalable y alineada con la estrategia del negocio. Se gobierna con principios explícitos, facilita interoperabilidad y velocidad de cambio, y reduce complejidad mediante una evolución deliberada del landscape.",
        ],
        opp: "Arquitectura modular y escalable, alineada con estrategia; gobernada con principios explícitos que facilitan interoperabilidad y velocidad de cambio.",
      },
      {
        id: "td2", label: "Sistemas y herramientas de TI", desc: "Soporte integrado y confiable de sistemas para procesos prioritarios",
        q: "Evalúe el nivel de madurez en Sistemas y herramientas de TI",
        ndesc: [
          "Las herramientas y sistemas no soportan de forma consistente los procesos ni la colaboración entre áreas. Existe proliferación de soluciones, uso intensivo de workarounds y baja integración.",
          "Se han consolidado o modernizado algunos sistemas, pero todavía coexisten herramientas duplicadas, integraciones parciales y soluciones locales. Los sistemas soportan parcialmente la operación con fricciones relevantes.",
          "Los sistemas y herramientas clave soportan la mayoría de procesos prioritarios y permiten una operación razonablemente integrada. Persisten oportunidades para simplificación y estandarización.",
          "La organización dispone de sistemas y herramientas integrados, confiables y orientados a la experiencia del usuario y al valor del negocio. El landscape se gestiona con disciplina, minimiza redundancias y habilita automatización y escalabilidad.",
        ],
        opp: "Sistemas integrados, confiables y orientados a valor; landscape gestionado con disciplina que habilita automatización y escalabilidad.",
      },
      {
        id: "td3", label: "Datos y analítica avanzada", desc: "Gobernanza de datos y capacidades analíticas para decisiones data-driven",
        q: "Evalúe el nivel de madurez en Datos y analítica avanzada",
        ndesc: [
          "Los datos se usan principalmente para reporting histórico y con calidad, acceso o definiciones inconsistentes. No existe una base robusta para decisiones data-driven ni una capacidad analítica suficientemente desarrollada.",
          "Hay iniciativas de BI o analítica en ciertas áreas y algunos dashboards relevantes, pero la información sigue fragmentada. La organización no cuenta con una lógica integrada de gobierno, explotación y toma de decisiones basada en datos.",
          "La compañía dispone de información relativamente confiable para decisiones relevantes y cuenta con capacidades de analítica en procesos o dominios prioritarios. Existen avances en gobierno y acceso a datos.",
          "La organización opera como una compañía data-driven: fuentes confiables, gobierno claro, analítica avanzada y uso extendido de datos en decisiones estratégicas y operativas. Los datos habilitan anticipación, priorización y captura sistemática de valor.",
        ],
        opp: "Compañía data-driven: fuentes confiables, gobierno claro y analítica avanzada para anticipación, priorización y captura de valor.",
      },
    ],
  },
  {
    key: "cadena", label: "Cadena de Valor y Alianzas", num: "06", icon: "🔗",
    sub: "Make vs. buy, ecosistema de partners, servicios compartidos y huella geográfica",
    subs: [
      {
        id: "cv1", label: "Make vs. buy", desc: "Criterios estratégicos para decidir qué hacer internamente y qué tercerizar",
        q: "Evalúe el nivel de madurez en Make vs. buy",
        ndesc: [
          "Las decisiones sobre qué hacer internamente y qué tercerizar se toman caso a caso, con foco táctico y sin criterios explícitos sobre capacidades críticas, costo total, control, riesgo o velocidad.",
          "Existen criterios básicos para evaluar outsourcing o partnering en ciertas categorías, pero su aplicación no es uniforme ni está conectada a una visión integral de capacidades estratégicas.",
          "La organización cuenta con lineamientos relativamente claros para decisiones de make vs. buy, incorporando criterios de costo, calidad, riesgo, velocidad y criticidad estratégica.",
          "Las decisiones de make vs. buy se gestionan como una palanca estratégica del modelo operativo. La compañía revisa periódicamente qué capacidades debe construir, conservar, adquirir o tercerizar con criterios robustos y alineados con estrategia y creación de valor.",
        ],
        opp: "Make vs. buy gestionado como palanca estratégica; revisión periódica con criterios robustos alineados a estrategia y creación de valor.",
      },
      {
        id: "cv2", label: "Gestión de ecosistema y partners", desc: "Orquestación de partners como extensión del modelo operativo",
        q: "Evalúe el nivel de madurez en Gestión de ecosistema y partners",
        ndesc: [
          "Las relaciones con partners y terceros son esencialmente transaccionales y orientadas a cumplimiento básico. No existe un modelo claro para gestionar desempeño, riesgos, interdependencias o generación conjunta de valor.",
          "Algunos partners estratégicos tienen seguimiento y mecanismos de interacción definidos, pero la gestión del ecosistema sigue siendo desigual y con foco limitado en valor integral.",
          "La organización gestiona de manera estructurada a los partners más relevantes, con criterios de desempeño, niveles de servicio, gobernanza y escalamiento.",
          "La compañía orquesta un ecosistema de partners como extensión de su modelo operativo, con gobierno claro, métricas de valor, gestión activa de riesgos y mecanismos de colaboración sostenida que aceleran la ejecución estratégica.",
        ],
        opp: "Ecosistema de partners orquestado como extensión del modelo operativo; gobierno claro, métricas de valor y colaboración sostenida.",
      },
      {
        id: "cv3", label: "Servicios compartidos", desc: "Modelo de servicios compartidos como plataforma de eficiencia y calidad",
        q: "Evalúe el nivel de madurez en Servicios compartidos",
        ndesc: [
          "No existe una lógica clara sobre qué actividades deberían centralizarse o prestarse como servicio compartido. Las actividades transaccionales están dispersas, con distintos niveles de calidad, costos y experiencia de servicio.",
          "Se han centralizado algunas actividades o se han discutido opciones de servicios compartidos, pero el modelo aún es parcial, con catálogos, niveles de servicio y mecanismos de gobierno poco maduros.",
          "La organización cuenta con un modelo de servicios compartidos para actividades seleccionadas, con alcance, responsabilidades y niveles de servicio razonablemente definidos. El esquema genera eficiencias y mayor consistencia.",
          "El modelo de servicios compartidos está diseñado y gestionado como plataforma de eficiencia y calidad, con catálogo claro, SLAs, automatización, métricas y mejora continua. Maximiza escala y estandarización sin perder foco en servicio y flexibilidad.",
        ],
        opp: "Servicios compartidos como plataforma de eficiencia: catálogo claro, SLAs, automatización, métricas y mejora continua.",
      },
      {
        id: "cv4", label: "Huella geográfica", desc: "Distribución estratégica de actividades y capacidades",
        q: "Evalúe el nivel de madurez en Huella geográfica",
        ndesc: [
          "La huella geográfica de actividades, capacidades y decisiones responde principalmente a legados históricos o conveniencias locales, sin una lógica explícita de costo, acceso a talento, cercanía al negocio, resiliencia o nivel de servicio.",
          "Existen decisiones puntuales para relocalizar, centralizar o distribuir actividades, pero sin una arquitectura integral de huella geográfica. La organización empieza a evaluar trade-offs con criterios parciales.",
          "La compañía ha definido una lógica relativamente clara para ubicar actividades y capacidades según naturaleza del trabajo, necesidades del negocio y criterios de eficiencia/control.",
          "La huella geográfica se gestiona estratégicamente, equilibrando cercanía al cliente, acceso a talento, resiliencia, costo y escalabilidad. La organización revisa y ajusta su distribución de actividades de forma proactiva para habilitar competitividad y flexibilidad.",
        ],
        opp: "Huella geográfica gestionada estratégicamente; equilibra cercanía al cliente, talento, resiliencia y costo con revisión proactiva.",
      },
    ],
  },
];

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const LV = [
  { v:1, label:"Naciente",       c:"#78716C", bg:"#FAFAF8", border:"#78716C30", text:"#78716C" },
  { v:2, label:"Emergente",      c:"#D97706", bg:"#FFFBEB", border:"#D9770630", text:"#D97706" },
  { v:3, label:"Robusto",        c:"#2563EB", bg:"#EFF6FF", border:"#2563EB30", text:"#2563EB" },
  { v:4, label:"Best-in-Class",  c:"#059669", bg:"#ECFDF5", border:"#05966930", text:"#059669" },
];
function getLv(v) { return LV[Math.max(0, Math.min(3, (v||1)-1))]; }

const DIRECCIONES = [
  "Unidad de Mercado Masivo (UMC)",
  "Unidad de Mercado Corporativo (UMM)",
  "Gestión Humana",
  "Financiera",
  "Jurídica y Sostenibilidad",
  "Tecnología",
  "Planeación Estratégica",
  "Auditoría",
  "Riesgo y Control Interno",
];

const EC = "#7823DC";
const ECD = "#5A1AA0";

const T = {
  bg: "#F7F5F2", card: "#FFFFFF", surface: "#FBF9F7",
  borderSm: "#E8E4DF", borderMd: "#D9D5CF",
  ink: "#1A1A18", inkMid: "#555550", inkSoft: "#999990",
  L: LV,
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GS = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;font-family:'Outfit',system-ui,sans-serif;}
body{margin:0;background:#F7F5F2;color:#1A1A18;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#D9D5CF;border-radius:99px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-up{animation:fadeUp .4s cubic-bezier(.22,1,.36,1) both;}
.fade-up-1{animation:fadeUp .4s .06s cubic-bezier(.22,1,.36,1) both;}
.fade-up-2{animation:fadeUp .4s .12s cubic-bezier(.22,1,.36,1) both;}
.fade-up-3{animation:fadeUp .4s .18s cubic-bezier(.22,1,.36,1) both;}
.scale-in{animation:scaleIn .3s cubic-bezier(.22,1,.36,1) both;}
.spin{animation:spin .8s linear infinite;}
.tab-pill{transition:all .15s;}
.sidebar-item{transition:background .12s;}
.lv-card{cursor:pointer;transition:all .18s cubic-bezier(.22,1,.36,1);}
.lv-card:hover{transform:translateY(-2px);}
.lv-card.selected{transform:translateY(-3px);}
.sub-pill{transition:all .15s cubic-bezier(.22,1,.36,1);}
.sub-pill:hover{transform:translateY(-1px);}
.btn-action{transition:all .15s cubic-bezier(.22,1,.36,1);}
.btn-action:hover{transform:translateY(-1px);opacity:.88;}
.display{font-variant-numeric:tabular-nums;}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function LvBadge({ v, sm }) {
  if (!v) return null;
  const l = getLv(v);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding: sm?"2px 8px":"4px 12px",
      borderRadius:99, background:l.bg, border:`1px solid ${l.border}`,
      fontSize: sm?9.5:11, fontWeight:700, color:l.c,
    }}>
      <span style={{ width:sm?4:5, height:sm?4:5, borderRadius:"50%", background:l.c }} />
      {sm ? l.label : `${v} · ${l.label}`}
    </span>
  );
}

function KearneySVG({ height = 18 }) {
  return (
    <svg height={height} viewBox="0 0 600 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="62" fontFamily="'Outfit',system-ui,sans-serif" fontSize="72" fontWeight="900" letterSpacing="12" fill="#1A1A18">KEARNEY</text>
    </svg>
  );
}

function getDimScore(dim, answers) {
  const vals = dim.subs.map(s => answers[s.id]).filter(v => v > 0);
  if (!vals.length) return null;
  return (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2);
}

// ─── INTRO TAB ────────────────────────────────────────────────────────────────
function IntroTab({ onStart }) {
  return (
    <div style={{ maxWidth:820, margin:"0 auto", padding:"56px 32px" }}>
      <div className="fade-up" style={{ textAlign:"center", marginBottom:52 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          padding:"6px 16px", borderRadius:99,
          background:EC+"12", border:`1px solid ${EC}25`,
          fontSize:11, fontWeight:700, color:EC,
          textTransform:"uppercase", letterSpacing:".12em", marginBottom:20,
        }}>Estadios de Excelencia · Modelo Operativo</div>

        <h1 style={{
          fontSize:38, fontWeight:900, color:T.ink,
          lineHeight:1.15, letterSpacing:"-.025em", margin:"0 0 16px",
        }}>
          Autoevaluación<br/>
          <span style={{ background:`linear-gradient(135deg,${EC},#C01010)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Diseño Organizacional
          </span>
        </h1>

        <p style={{ fontSize:15, color:T.inkMid, lineHeight:1.75, maxWidth:580, margin:"0 auto 32px" }}>
          Evalúa el nivel de madurez actual del modelo operativo de Claro en 6 componentes,
          identifica brechas y prioriza iniciativas para la fase de diagnóstico.
        </p>

        <button onClick={onStart} style={{
          padding:"14px 36px", borderRadius:14, border:"none",
          background:`linear-gradient(135deg,${EC},${ECD})`,
          color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer",
          boxShadow:`0 8px 24px ${EC}40`, letterSpacing:".01em",
        }}>
          Iniciar evaluación →
        </button>
      </div>

      {/* Dimensiones overview */}
      <div className="fade-up-2" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:40 }}>
        {DIMS.map((d) => (
          <div key={d.key} style={{
            padding:"18px 20px", borderRadius:14,
            background:T.card, border:`1px solid ${T.borderSm}`,
            display:"flex", alignItems:"flex-start", gap:12,
          }}>
            <div style={{
              width:38, height:38, borderRadius:10, fontSize:18,
              background:EC+"12", border:`1px solid ${EC}20`,
              display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
            }}>{d.icon}</div>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:EC, textTransform:"uppercase", letterSpacing:".1em", marginBottom:3 }}>{d.num}</div>
              <div style={{ fontSize:12.5, fontWeight:700, color:T.ink, marginBottom:2 }}>{d.label}</div>
              <div style={{ fontSize:10.5, color:T.inkSoft, lineHeight:1.5 }}>{d.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Escala */}
      <div className="fade-up-3" style={{
        padding:"24px 28px", borderRadius:16,
        background:T.card, border:`1px solid ${T.borderSm}`,
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:T.inkSoft, textTransform:"uppercase", letterSpacing:".12em", marginBottom:18 }}>
          Escala de madurez
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
          {LV.map(l => (
            <div key={l.v} style={{ textAlign:"center", padding:"12px 8px", borderRadius:10, background:l.bg, border:`1px solid ${l.border}` }}>
              <div style={{ fontSize:22, fontWeight:900, color:l.c, lineHeight:1, marginBottom:4 }}>{l.v}</div>
              <div style={{ fontSize:11, fontWeight:700, color:l.c }}>{l.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SUMMARY TAB ──────────────────────────────────────────────────────────────
function SummaryTab({ answers, evalId }) {
  const navigate = useNavigate();

  const dimScores = DIMS.map(d => {
    const vals = d.subs.map(s => answers[s.id]).filter(v => v > 0);
    const score = vals.length ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2)) : null;
    return { ...d, score };
  });

  const globalScore = (() => {
    const filled = dimScores.filter(d => d.score);
    if (!filled.length) return null;
    return parseFloat((filled.reduce((a,d)=>a+d.score,0)/filled.length).toFixed(2));
  })();

  const strongest = [...dimScores].filter(d=>d.score).sort((a,b)=>b.score-a.score)[0];
  const weakest   = [...dimScores].filter(d=>d.score).sort((a,b)=>a.score-b.score)[0];

  // Brechas (score ≤ 2 en escala de 4)
  const gaps = dimScores
    .filter(d => d.score && d.score <= 2)
    .sort((a,b)=>a.score-b.score)
    .map(d => {
      const subGaps = d.subs
        .map(s => ({ ...s, score: answers[s.id]||0 }))
        .filter(s => s.score > 0 && s.score <= 2)
        .sort((a,b)=>a.score-b.score);
      return { ...d, subGaps };
    });

  async function downloadExcel() {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const resumenData = [
      ["Score Global", globalScore || "—"],
      [],
      ["Componente", "Score", "Nivel"],
      ...dimScores.map(d => [d.label, d.score || "—", d.score ? getLv(Math.round(d.score)).label : "—"]),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumenData), "Resumen");
    const respData = [
      ["Componente", "Sub-componente", "Valor", "Nivel"],
      ...DIMS.flatMap(d => d.subs.map(s => [d.label, s.label, answers[s.id]||"", answers[s.id]?getLv(answers[s.id]).label:""])),
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(respData), "Respuestas");
    XLSX.writeFile(wb, `evaluacion-estadios-excelencia-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"40px 32px" }}>

      {/* Header con score global */}
      <div className="fade-up" style={{
        background:`linear-gradient(135deg,${EC},${ECD})`,
        borderRadius:20, padding:"32px 36px", marginBottom:24,
        color:"#fff", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize:"20px 20px", pointerEvents:"none" }}/>
        <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"space-between", gap:24 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)", textTransform:"uppercase", letterSpacing:".12em", marginBottom:8 }}>Resultado de la evaluación</div>
            <div style={{ fontSize:44, fontWeight:900, lineHeight:1, letterSpacing:"-.03em", marginBottom:8 }}>
              {globalScore || "—"}<span style={{ fontSize:18, fontWeight:500, opacity:.6 }}> /4</span>
            </div>
            {globalScore && (
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", borderRadius:99, background:"rgba(255,255,255,.15)", fontSize:13, fontWeight:700 }}>
                {getLv(Math.round(globalScore)).label}
              </div>
            )}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, alignItems:"flex-end" }}>
            {strongest && (
              <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>
                💪 Más fuerte: <strong style={{ color:"#fff" }}>{strongest.label}</strong> ({strongest.score})
              </div>
            )}
            {weakest && (
              <div style={{ fontSize:11, color:"rgba(255,255,255,.7)" }}>
                ⚠️ Más débil: <strong style={{ color:"#fff" }}>{weakest.label}</strong> ({weakest.score})
              </div>
            )}
            <button onClick={downloadExcel} style={{
              padding:"8px 20px", borderRadius:10, border:"1px solid rgba(255,255,255,.3)",
              background:"rgba(255,255,255,.15)", color:"#fff",
              fontWeight:700, fontSize:12, cursor:"pointer",
            }}>
              ⬇ Descargar Excel
            </button>
          </div>
        </div>
      </div>

      {/* Scores por componente */}
      <div className="fade-up-1" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10, marginBottom:24 }}>
        {dimScores.map(d => {
          const l = d.score ? getLv(Math.round(d.score)) : null;
          return (
            <div key={d.key} style={{
              padding:"16px 20px", borderRadius:14,
              background:T.card, border:`1px solid ${T.borderSm}`,
              display:"flex", alignItems:"center", gap:14,
            }}>
              <div style={{
                width:40, height:40, borderRadius:11, fontSize:18,
                background:EC+"12", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>{d.icon}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11.5, fontWeight:700, color:T.ink, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.label}</div>
                <div style={{ height:5, background:T.borderSm, borderRadius:99, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${((d.score||0)/4)*100}%`, background:l?.c||"#E8E4DF", borderRadius:99, transition:"width .6s" }} />
                </div>
              </div>
              <div style={{ flexShrink:0, textAlign:"right" }}>
                {d.score ? (
                  <>
                    <div style={{ fontSize:18, fontWeight:900, color:l.c, lineHeight:1 }}>{d.score}</div>
                    <div style={{ fontSize:9, color:l.c, fontWeight:700 }}>{l.label}</div>
                  </>
                ) : <span style={{ color:"#CCC", fontSize:12 }}>—</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Brechas */}
      {gaps.length > 0 && (
        <div className="fade-up-2">
          <div style={{ fontSize:11, fontWeight:700, color:T.inkSoft, textTransform:"uppercase", letterSpacing:".12em", marginBottom:14 }}>
            🚨 Brechas identificadas ({gaps.length} componentes)
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {gaps.map(g => {
              const gl = getLv(Math.round(g.score));
              return (
                <div key={g.key} style={{ borderRadius:14, border:`1.5px solid ${gl.border}`, overflow:"hidden" }}>
                  <div style={{ padding:"14px 20px", background:gl.bg, borderBottom:`1px solid ${gl.border}`, display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:20 }}>{g.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:T.ink }}>{g.label}</div>
                      <div style={{ fontSize:10, color:T.inkSoft, marginTop:1 }}>{g.sub}</div>
                    </div>
                    <LvBadge v={Math.round(g.score)} />
                    <div style={{ fontSize:14, fontWeight:900, color:gl.c }}>{g.score}</div>
                  </div>
                  {g.subGaps.length > 0 && (
                    <div style={{ padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
                      {g.subGaps.map(s => {
                        const sl = getLv(s.score);
                        const curDesc = s.ndesc?.[s.score-1] || null;
                        const nextDesc = s.ndesc?.[s.score] || null;
                        return (
                          <div key={s.id} style={{ borderRadius:10, border:`1px solid ${sl.border}`, overflow:"hidden" }}>
                            <div style={{ padding:"8px 14px", background:sl.bg, display:"flex", alignItems:"center", gap:10, borderBottom:`1px solid ${sl.border}` }}>
                              <span style={{ fontSize:14, fontWeight:900, color:sl.c, minWidth:24, textAlign:"center" }}>{s.score}</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:11, fontWeight:700, color:T.ink }}>{s.label}</div>
                                <div style={{ fontSize:9.5, color:T.inkSoft }}>{s.desc}</div>
                              </div>
                              <LvBadge v={s.score} sm />
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                              {curDesc && (
                                <div style={{ padding:"10px 14px", background:"#FFF8F8", borderRight:`1px solid ${T.borderSm}` }}>
                                  <div style={{ fontSize:8.5, fontWeight:700, color:"#DC2626", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>📍 Estado actual</div>
                                  <div style={{ fontSize:10.5, color:"#7F1D1D", lineHeight:1.65 }}>{curDesc}</div>
                                </div>
                              )}
                              {nextDesc && (
                                <div style={{ padding:"10px 14px", background:"#F0FDF4" }}>
                                  <div style={{ fontSize:8.5, fontWeight:700, color:"#059669", textTransform:"uppercase", letterSpacing:".08em", marginBottom:4 }}>🚀 Iniciativa recomendada</div>
                                  <div style={{ fontSize:10.5, color:"#064E3B", lineHeight:1.65, fontStyle:"italic" }}>{s.opp}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function ModeloOperativo() {
  const navigate = useNavigate();
  const [view, setView] = useState("intro");
  const [answers, setAnswers] = useState({});
  const [activeDim, setActiveDim] = useState(0);
  const [activeSub, setActiveSub] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [guardarError, setGuardarError] = useState(false);
  const [evalId, setEvalId] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showDirModal, setShowDirModal] = useState(false);
  const [direccion, setDireccion] = useState("");
  const assessScrollRef = useRef(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = GS;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  const totalQ = DIMS.reduce((a,d)=>a+d.subs.length, 0);
  const answered = Object.values(answers).filter(v=>v>0).length;
  const pct = Math.round((answered/totalQ)*100);
  const completedDims = DIMS.filter(d=>d.subs.every(s=>answers[s.id]>0)).length;

  const dim = DIMS[activeDim];
  const sub = dim.subs[activeSub];

  const totalScore = useMemo(() => {
    const dimScores = DIMS.map(d => {
      const vals = d.subs.map(s=>answers[s.id]).filter(v=>v>0);
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    }).filter(Boolean);
    if (!dimScores.length) return null;
    return (dimScores.reduce((a,b)=>a+b,0)/dimScores.length).toFixed(2);
  }, [answers]);

  function setVal(id, v) {
    setAnswers(prev => {
      const next = { ...prev, [id]: v };
      setSavedOk(false);
      return next;
    });
  }

  async function guardarProgreso(currentAnswers) {
    setSaving(true); setGuardarError(false); setSavedOk(false);
    try {
      const dimScores = DIMS.reduce((acc, d) => {
        const vals = d.subs.map(s=>currentAnswers[s.id]).filter(v=>v>0);
        acc[`score_${d.key}`] = vals.length
          ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2))
          : null;
        return acc;
      }, {});
      const globalVals = Object.values(dimScores).filter(Boolean);
      const score_global = globalVals.length
        ? parseFloat((globalVals.reduce((a,b)=>a+b,0)/globalVals.length).toFixed(2))
        : null;

      const payload = { score_global, ...dimScores, direccion: direccion || null };

      let id = evalId;
      if (id) {
        const { error } = await supabase.from("evaluaciones_op").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("evaluaciones_op").insert([payload]).select().single();
        if (error) throw error;
        id = data.id;
        setEvalId(id);
      }

      const rows = DIMS.flatMap(d =>
        d.subs
          .filter(s => currentAnswers[s.id] > 0)
          .map(s => ({
            evaluacion_id: id,
            subdimension_id: s.id,
            dimension_key: d.key,
            valor: currentAnswers[s.id],
          }))
      );
      if (rows.length) {
        await supabase.from("respuestas_op").upsert(rows, { onConflict: "evaluacion_id,subdimension_id" });
      }

      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch(e) {
      console.error("Error guardando:", e);
      setGuardarError(true);
      setTimeout(() => setGuardarError(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function doReset() {
    setAnswers({}); setActiveDim(0); setActiveSub(0);
    setView("intro"); setEvalId(null); setDireccion("");
    setSavedOk(false); setConfirmReset(false);
  }

  const TABS = [
    { id:"intro",      label:"Introducción", icon:"📘" },
    { id:"assessment", label:"Evaluación",   icon:"📝" },
    { id:"summary",    label:"Resumen",      icon:"📊" },
  ];

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:T.bg }}>

      {/* ═══ HEADER ═══ */}
      <header style={{
        height:56, flexShrink:0,
        background:T.card, borderBottom:`1px solid ${T.borderSm}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <KearneySVG height={16} />
          <div style={{ width:1, height:28, background:T.borderSm }} />
          <div style={{ display:"flex", flexDirection:"column" }}>
            <span style={{ fontSize:11, fontWeight:700, color:EC, textTransform:"uppercase", letterSpacing:".14em", lineHeight:1.2 }}>
              Claro · Modelo Operativo
            </span>
            <span style={{ fontSize:9, color:T.inkSoft, fontWeight:500 }}>Estadios de Excelencia</span>
          </div>
        </div>

        {totalScore && (
          <div style={{
            display:"flex", alignItems:"center", gap:8,
            padding:"5px 14px", background:EC+"10",
            borderRadius:99, border:`1px solid ${EC+"30"}`,
          }}>
            <span style={{ fontSize:10, color:T.inkMid, fontWeight:500 }}>Global</span>
            <span className="display" style={{ fontSize:18, fontWeight:900, color:EC }}>{totalScore}</span>
            <span style={{ fontSize:10, color:T.inkSoft }}>/4</span>
            <LvBadge v={Math.round(Number(totalScore))} sm />
          </div>
        )}

        <div style={{
          display:"flex", gap:2,
          background:T.surface, borderRadius:12, padding:"3px",
          border:`1px solid ${T.borderSm}`,
        }}>
          {TABS.map(t=>(
            <button key={t.id} className="tab-pill" onClick={()=>setView(t.id)} style={{
              padding:"6px 14px", borderRadius:10, border:"none",
              background:view===t.id?T.card:"transparent",
              color:view===t.id?EC:T.inkMid,
              fontWeight:view===t.id?700:500,
              fontSize:11, cursor:"pointer",
              borderBottom:view===t.id?`2px solid ${EC}`:"2px solid transparent",
              boxShadow:view===t.id?"0 2px 6px rgba(0,0,0,0.09)":"none",
              whiteSpace:"nowrap",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setConfirmReset(true)} title="Reiniciar evaluación" style={{
            width:34, height:34, borderRadius:9, border:`1px solid ${T.borderSm}`,
            background:T.card, color:T.inkMid,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:14, flexShrink:0,
          }}>↺</button>

          <button onClick={()=>navigate("/admin")} title="Tablero de Control" style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"6px 14px", borderRadius:9,
            border:`1px solid ${T.borderSm}`,
            background:T.card, color:T.inkMid,
            fontSize:11, fontWeight:600, cursor:"pointer",
          }}>
            📊 Admin
          </button>
        </div>
      </header>

      {/* ═══ CONTENT ═══ */}
      {view === "intro" && (
        <div style={{ flex:1, overflow:"auto" }}>
          <IntroTab onStart={() => setShowDirModal(true)} />
        </div>
      )}

      {view === "summary" && (
        <div style={{ flex:1, overflow:"auto" }}>
          <SummaryTab answers={answers} evalId={evalId} />
        </div>
      )}

      {view === "assessment" && (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* SIDEBAR */}
          <aside style={{
            width:224, background:T.card,
            borderRight:`1px solid ${T.borderSm}`,
            overflow:"auto", flexShrink:0,
          }}>
            <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.borderSm}`, background:T.surface }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:9, fontWeight:700, color:T.inkSoft, textTransform:"uppercase", letterSpacing:".12em" }}>Progreso</span>
                <span className="display" style={{ fontSize:14, fontWeight:900, color:EC }}>{pct}%</span>
              </div>
              <div style={{ height:5, background:T.borderSm, borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${EC},#FF6B6B)`, borderRadius:99, transition:"width .5s" }} />
              </div>
              <div style={{ fontSize:9, color:T.inkSoft, marginTop:5 }}>{answered}/{totalQ} resp. · {completedDims}/{DIMS.length} comp.</div>
            </div>

            {DIMS.map((d, i) => {
              const sc = getDimScore(d, answers);
              const active = i === activeDim;
              return (
                <div key={d.key}>
                  <div className="sidebar-item" style={{
                    width:"100%", textAlign:"left", padding:"10px 14px",
                    background:active?"#FFF8F7":"transparent",
                    borderLeft:`3px solid ${active?EC:"transparent"}`,
                    borderBottom:`1px solid ${T.borderSm}`,
                    cursor:"default",
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <span style={{ fontSize:15 }}>{d.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10.5, fontWeight:active?700:500, color:active?EC:T.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.num} {d.label}</div>
                        <div style={{ fontSize:8.5, color:T.inkSoft, marginTop:1 }}>{d.subs.filter(s=>answers[s.id]>0).length}/{d.subs.length} evaluadas</div>
                      </div>
                      {sc && <span className="display" style={{ fontSize:12, fontWeight:900, color:getLv(Math.round(sc)).c, flexShrink:0 }}>{sc}</span>}
                    </div>
                    {sc && (
                      <div style={{ marginTop:4, height:3, background:T.borderSm, borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(sc/4)*100}%`, background:getLv(Math.round(sc)).c, borderRadius:99, transition:"width .4s" }} />
                      </div>
                    )}
                  </div>
                  {active && (
                    <div style={{ paddingLeft:30, paddingBottom:6, background:"#FFFAF9" }}>
                      {d.subs.map((s, j) => (
                        <div key={s.id} style={{
                          padding:"4px 10px", borderRadius:7,
                          background:j===activeSub?"#FFF1F0":"transparent",
                          cursor:"default", marginBottom:1,
                        }}>
                          <span style={{ fontSize:9.5, fontWeight:j===activeSub?700:400, color:j===activeSub?EC:answers[s.id]?getLv(answers[s.id]).text:T.inkSoft }}>
                            {answers[s.id]?"●":"○"} {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </aside>

          {/* MAIN */}
          <main ref={assessScrollRef} style={{ flex:1, overflow:"auto", padding:"32px 36px", position:"relative" }}>

            {/* dim header */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
              <div style={{
                width:48, height:48, borderRadius:14,
                background:EC+"18", border:`1.5px solid ${EC+"30"}`,
                display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
              }}>
                <span style={{ fontSize:23 }}>{dim.icon}</span>
              </div>
              <div style={{ flex:1 }}>
                <div className="display" style={{ fontSize:18, fontWeight:900, color:T.ink, letterSpacing:"-.02em" }}>{dim.num}. {dim.label}</div>
                <div style={{ fontSize:11, color:T.inkSoft, marginTop:2 }}>{dim.sub}</div>
              </div>
              <button
                onClick={() => guardarProgreso(answers)}
                disabled={saving}
                style={{
                  display:"flex", alignItems:"center", gap:6,
                  padding:"7px 18px", borderRadius:99, flexShrink:0, border:"none",
                  background:guardarError?"#FEF2F2":savedOk?"#ECFDF5":saving?"#F0EDE9":`linear-gradient(135deg,${EC},${ECD})`,
                  color:savedOk?"#059669":saving?"#AAA":"#fff",
                  fontSize:12, fontWeight:700, cursor:saving?"default":"pointer",
                  boxShadow:saving||savedOk?"none":`0 2px 12px ${EC}44`, transition:"all .2s",
                }}
              >
                <span style={{ fontSize:13 }}>{guardarError?"!":saving?"⏳":savedOk?"✓":"↑"}</span>
                <span>{guardarError?"Error":saving?"Guardando":savedOk?"Guardado":"Guardar"}</span>
              </button>
              {getDimScore(dim, answers) && (
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <LvBadge v={Math.round(getDimScore(dim, answers))} />
                  <span className="display" style={{ fontSize:22, fontWeight:900, color:getLv(Math.round(getDimScore(dim,answers))).c }}>
                    {getDimScore(dim, answers)}
                  </span>
                </div>
              )}
            </div>

            {/* Sub pills */}
            <div style={{ display:"flex", gap:6, marginBottom:20, flexWrap:"wrap" }}>
              {dim.subs.map((s, j) => (
                <button key={s.id} className="sub-pill" onClick={() => setActiveSub(j)} style={{
                  padding:"5px 13px", borderRadius:99,
                  border:`1.5px solid ${j===activeSub?EC:answers[s.id]?getLv(answers[s.id]).border:T.borderSm}`,
                  background:j===activeSub?EC:answers[s.id]?getLv(answers[s.id]).bg:T.card,
                  color:j===activeSub?"#fff":answers[s.id]?getLv(answers[s.id]).text:T.inkMid,
                  fontSize:10.5, fontWeight:j===activeSub?700:500,
                  whiteSpace:"nowrap", cursor:"pointer",
                  boxShadow:j===activeSub?`0 3px 10px rgba(120,35,220,0.3)`:"none",
                }}>
                  {answers[s.id]?`${answers[s.id]} · `:""}{s.label}
                </button>
              ))}
            </div>

            {/* Sub card */}
            <div key={sub.id} className="scale-in" style={{
              background:T.card, borderRadius:18,
              border:`1px solid ${T.borderSm}`,
              padding:"26px", marginBottom:20,
              boxShadow:"0 4px 16px rgba(0,0,0,0.06)",
            }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, gap:14 }}>
                <div style={{ flex:1 }}>
                  <div className="display" style={{ fontSize:16, fontWeight:800, color:T.ink, letterSpacing:"-.015em", marginBottom:5 }}>{sub.label}</div>
                  <div style={{ fontSize:12, color:T.inkMid, marginBottom:sub.q?10:0 }}>{sub.desc}</div>
                  {sub.q && (
                    <div style={{ fontSize:13, color:T.ink, lineHeight:1.6, fontStyle:"italic", padding:"10px 14px", background:"#F7F3FF", borderRadius:10, borderLeft:`3px solid ${EC}` }}>
                      {sub.q}
                    </div>
                  )}
                </div>
                {answers[sub.id]>0 && <LvBadge v={answers[sub.id]} />}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                {T.L.map((l, i) => {
                  const v = i+1;
                  const sel = answers[sub.id] === v;
                  return (
                    <div key={v} className={`lv-card${sel?" selected":""}`} onClick={() => setVal(sub.id, v)} style={{
                      borderRadius:14, border:`2px solid ${sel?l.c:l.border}`,
                      background:sel?l.bg:T.card, overflow:"hidden",
                      boxShadow:sel?`0 6px 20px ${l.c}40`:"0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                      <div style={{ background:l.c, padding:"9px 11px", display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <span className="display" style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{v}</span>
                        </div>
                        <span style={{ fontSize:9, fontWeight:700, color:"#fff", textTransform:"uppercase", letterSpacing:".06em", flex:1 }}>{l.label}</span>
                        {sel && <span style={{ fontSize:11, color:"#fff" }}>✓</span>}
                      </div>
                      <div style={{ padding:"11px 11px 7px" }}>
                        <p style={{ fontSize:10, color:sel?l.text:T.inkMid, margin:0, lineHeight:1.65 }}>{sub.ndesc[i]}</p>
                      </div>
                      <div style={{ padding:"0 11px 10px", display:"flex", gap:3 }}>
                        {[0,1,2,3].map(j=><div key={j} style={{ flex:1, height:3, borderRadius:99, background:j<=i?l.c:T.borderSm }} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nav */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button onClick={() => {
                if (activeSub > 0) setActiveSub(activeSub-1);
                else if (activeDim > 0) { setActiveDim(activeDim-1); setActiveSub(DIMS[activeDim-1].subs.length-1); }
              }} disabled={activeDim===0 && activeSub===0} style={{
                padding:"10px 22px", borderRadius:12,
                border:`1.5px solid ${T.borderSm}`, background:T.card,
                color:T.inkMid, fontWeight:600, fontSize:12, cursor:"pointer",
                opacity:(activeDim===0&&activeSub===0)?.4:1, transition:"all .15s",
              }}>← Anterior</button>
              <div style={{ fontSize:10.5, color:T.inkSoft }}>{dim.num} · {activeSub+1}/{dim.subs.length}</div>
              {activeDim===DIMS.length-1 && activeSub===dim.subs.length-1 ? (
                <button onClick={async () => { await guardarProgreso(answers); setView("summary"); }} disabled={saving} style={{
                  padding:"10px 28px", borderRadius:12, border:"none",
                  background:saving?"#F0EDE9":`linear-gradient(135deg,#059669,#047857)`,
                  color:saving?"#AAA":"#fff", fontWeight:700, fontSize:12, cursor:saving?"default":"pointer",
                  boxShadow:saving?"none":"0 4px 14px rgba(5,150,105,0.4)",
                }}>
                  {saving ? "⏳ Guardando..." : "💾 Guardar y finalizar →"}
                </button>
              ) : (
                <button onClick={() => {
                  if (activeSub < dim.subs.length-1) setActiveSub(activeSub+1);
                  else { setActiveDim(activeDim+1); setActiveSub(0); }
                }} style={{
                  padding:"10px 24px", borderRadius:12, border:"none",
                  background:`linear-gradient(135deg,${EC},${ECD})`,
                  color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer",
                  boxShadow:`0 4px 14px rgba(120,35,220,0.35)`,
                }}>
                  Siguiente →
                </button>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        background:T.card, borderTop:`1px solid ${T.borderSm}`,
        height:44, display:"flex", alignItems:"center",
        justifyContent:"center", padding:"0 24px", flexShrink:0,
        gap:8,
      }}>
        <span style={{ fontSize:10, color:T.inkSoft }}>
          {DIMS.length} componentes · {totalQ} sub-componentes · {answered} respondidas
        </span>
        {answered > 0 && (
          <>
            <span style={{ color:T.borderMd }}>·</span>
            <span style={{ fontSize:10, color:EC, fontWeight:600 }}>{pct}% completado</span>
          </>
        )}
      </footer>

      {/* ═══ MODALS ═══ */}
      {confirmReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, backdropFilter:"blur(4px)" }}>
          <div className="scale-in" style={{ width:360, background:T.card, borderRadius:20, border:`1px solid ${T.borderSm}`, padding:"36px 32px", boxShadow:"0 40px 80px rgba(0,0,0,0.15)", textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:14 }}>↺</div>
            <div style={{ fontSize:16, fontWeight:800, color:T.ink, marginBottom:8 }}>¿Reiniciar evaluación?</div>
            <div style={{ fontSize:12, color:T.inkMid, lineHeight:1.7, marginBottom:28 }}>Se borrarán todas las respuestas actuales. Esta acción no se puede deshacer.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setConfirmReset(false)} style={{ flex:1, padding:"11px", borderRadius:10, border:`1px solid ${T.borderSm}`, background:T.surface, color:T.inkMid, fontWeight:600, fontSize:13, cursor:"pointer" }}>Cancelar</button>
              <button onClick={doReset} style={{ flex:1, padding:"11px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${EC},${ECD})`, color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer" }}>Reiniciar</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL SELECCIÓN DE DIRECCIÓN ═══ */}
      {showDirModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, backdropFilter:"blur(4px)" }}>
          <div className="scale-in" style={{ width:440, background:T.card, borderRadius:22, border:`1px solid ${T.borderSm}`, padding:"36px 32px", boxShadow:"0 40px 80px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:52, height:52, borderRadius:14,
                background:EC+"15", border:`1.5px solid ${EC}25`, marginBottom:14,
              }}>
                <span style={{ fontSize:26 }}>🏢</span>
              </div>
              <div style={{ fontSize:18, fontWeight:800, color:T.ink, marginBottom:6 }}>Selecciona tu dirección</div>
              <div style={{ fontSize:12, color:T.inkMid, lineHeight:1.6 }}>
                Elige la dirección a la que perteneces para personalizar la evaluación.
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:24, maxHeight:320, overflow:"auto" }}>
              {DIRECCIONES.map(d => (
                <button key={d} onClick={() => setDireccion(d)} style={{
                  padding:"12px 16px", borderRadius:12, border:`2px solid ${direccion===d?EC:T.borderSm}`,
                  background:direccion===d?EC+"10":T.card,
                  color:direccion===d?EC:T.ink,
                  fontWeight:direccion===d?700:500, fontSize:13,
                  cursor:"pointer", textAlign:"left",
                  transition:"all .15s",
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <span style={{
                    width:20, height:20, borderRadius:"50%",
                    border:`2px solid ${direccion===d?EC:T.borderMd}`,
                    background:direccion===d?EC:"transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, transition:"all .15s",
                  }}>
                    {direccion===d && <span style={{ color:"#fff", fontSize:11, fontWeight:900 }}>✓</span>}
                  </span>
                  {d}
                </button>
              ))}
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowDirModal(false)} style={{
                flex:1, padding:"12px", borderRadius:12,
                border:`1px solid ${T.borderSm}`, background:T.surface,
                color:T.inkMid, fontWeight:600, fontSize:13, cursor:"pointer",
              }}>Cancelar</button>
              <button onClick={() => { setShowDirModal(false); setView("assessment"); }} disabled={!direccion} style={{
                flex:1, padding:"12px", borderRadius:12, border:"none",
                background:direccion?`linear-gradient(135deg,${EC},${ECD})`:"#E8E4DF",
                color:direccion?"#fff":"#AAA",
                fontWeight:700, fontSize:13,
                cursor:direccion?"pointer":"not-allowed",
                boxShadow:direccion?`0 4px 14px ${EC}40`:"none",
              }}>Comenzar evaluación →</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
