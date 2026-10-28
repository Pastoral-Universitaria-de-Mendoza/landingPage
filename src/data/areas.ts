export interface Referente {
  nombre: string;
  rol: string;
  carrera: string;
  foto?: string;
  instagram?: string;
  email?: string;
  frase?: string;
}

export interface AreaData {
  slug: string;
  nombre: string;
  comunidad: "Comunidad de Estudiantes" | "Comunidad de Jóvenes Profesionales";
  lema: string;
  descripcionCorta: string;
  presentacion: string;
  queHacemos: string[];
  carreras: string[];
  bannerImg?: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  referentes: Referente[];
}

export const areas: AreaData[] = [
  {
    slug: "sociales",
    nombre: "SOCIALES",
    comunidad: "Comunidad de Estudiantes",
    lema: "Análisis de la realidad social, compromiso por la justicia, el bien común y el diálogo ético.",
    descripcionCorta:
      "Análisis de la realidad social, compromiso por la justicia, el bien común y el diálogo ético con las instituciones.",
    presentacion:
      "El Área de Sociales reúne a estudiantes y futuros profesionales de las ciencias jurídicas, políticas, comunicacionales y sociales. Desde nuestra fe cristiana nos comprometemos a interpretar la realidad territorial, promover la dignidad humana y construir puentes hacia una sociedad más justa, solidaria e inclusiva.",
    queHacemos: [
      "Asesoramiento y postas de orientación en derechos durante Manos a la Obra.",
      "Talleres de formación ciudadana, democracia y doctrina social de la Iglesia.",
      "Análisis interdisciplinario y debates sobre problemáticas comunitarias actuales.",
      "Articulación con organizaciones barriales e instituciones públicas de Mendoza."
    ],
    carreras: [
      "Derecho",
      "Ciencia Política",
      "Sociología",
      "Comunicación Social",
      "Economía",
      "Relaciones Internacionales",
      "Trabajo Social"
    ],
    bannerImg: "/images/areas/banner-sociales.jpeg",
    whatsappUrl:
      "https://chat.whatsapp.com/HuwSUHX8LbcGmDXmaLiHaJ?s=sw&p=a&mlu=4&ilr=4",
    referentes: [
      {
        nombre: "Referente Sociales",
        rol: "Coordinador de Área",
        carrera: "Estudiante de Abogacía",
        frase:
          "Ponemos el saber jurídico y social al servicio de la justicia y la dignidad humana.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Sociales",
        rol: "Equipo de Animación",
        carrera: "Estudiante de Comunicación Social",
        frase:
          "Comunicar con verdad y empatía es transformar nuestra sociedad desde el encuentro.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  },
  {
    slug: "ingenio",
    nombre: "INGENIO",
    comunidad: "Comunidad de Estudiantes",
    lema: "Desarrollo de soluciones técnicas, infraestructura, sustentabilidad e innovación tecnológica.",
    descripcionCorta:
      "Desarrollo de soluciones técnicas, infraestructura, sustentabilidad e innovación tecnológica al servicio de la comunidad.",
    presentacion:
      "El Área de Ingenio está conformada por estudiantes de las diversas ingenierías, informática, sistemas y ciencias exactas. Ponemos el conocimiento científico y la capacidad técnica en acción para resolver desafíos concretos de infraestructura, sustentabilidad ambiental y transformación digital en las comunidades que acompañamos.",
    queHacemos: [
      "Relevamiento y proyectos de infraestructura y mejoras edilicias en barrios vulnerables.",
      "Talleres de alfabetización digital y uso de tecnologías aplicadas.",
      "Desarrollo de herramientas técnicas y logísticas para las misiones de la PUM.",
      "Proyectos de energías renovables, cuidado del agua y sustentabilidad ambiental."
    ],
    carreras: [
      "Ingenierías",
      "Informática",
      "Sistemas",
      "Ciencias Exactas",
      "Agronomía"
    ],
    bannerImg: "/images/areas/banner-ingenio.jpeg",
    whatsappUrl: "https://chat.whatsapp.com/G7UJfXGmQOuCpLVRnpx4er?mode=gi_t",
    referentes: [
      {
        nombre: "Referente Ingenio",
        rol: "Coordinador de Área",
        carrera: "Estudiante de Ingeniería Industrial",
        frase:
          "La técnica cobra su sentido más pleno cuando se transforma en servicio concreto.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Ingenio",
        rol: "Equipo de Animación",
        carrera: "Estudiante de Ing. en Sistemas",
        frase:
          "Innovar con propósito: conectar la ciencia con las necesidades reales de la gente.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  },
  {
    slug: "creativa",
    nombre: "CREATIVA",
    comunidad: "Comunidad de Estudiantes",
    lema: "Expresión artística, diseño del espacio y comunicación visual para transmitir esperanza.",
    descripcionCorta:
      "Expresión artística, diseño del espacio y comunicación visual para transformar entornos y transmitir esperanza.",
    presentacion:
      "El Área Creativa congrega a estudiantes de arquitectura, diseño gráfico e industrial, artes visuales y música. Creemos que la belleza es un camino privilegiado de encuentro y sanación: transformamos espacios comunitarios a través del color, diseñamos identidad visual con mensaje de esperanza y animamos la liturgia y los encuentros con el arte.",
    queHacemos: [
      "Diseño e intervención artística de espacios comunitarios y murales participativos.",
      "Desarrollo de identidad gráfica y piezas de comunicación para campañas solidarias.",
      "Animación musical, ambientación y expresión artística en retiros y celebraciones.",
      "Talleres creativos de arte y reciclaje para infancias y jóvenes de la comunidad."
    ],
    carreras: [
      "Arquitectura",
      "Diseño Gráfico",
      "Diseño Industrial",
      "Artes Visuales",
      "Música"
    ],
    bannerImg: "/images/areas/banner-creativa.jpeg",
    whatsappUrl:
      "https://chat.whatsapp.com/EiCjNO8iHJvEM259lwNX9U?s=cl&p=a&mlu=4&ilr=4",
    referentes: [
      {
        nombre: "Referente Creativa",
        rol: "Coordinador de Área",
        carrera: "Estudiante de Diseño Gráfico",
        frase:
          "La belleza y el diseño son herramientas para transformar entornos y tocar corazones.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Creativa",
        rol: "Equipo de Animación",
        carrera: "Estudiante de Arquitectura",
        frase:
          "Pensar el espacio habitable es dignificar la vida y el encuentro en cada barrio.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  },
  {
    slug: "salud",
    nombre: "SALUD",
    comunidad: "Comunidad de Estudiantes",
    lema: "Cuidado integral y bioético de la persona, prevención sanitaria y postas de salud comunitaria.",
    descripcionCorta:
      "Cuidado integral y bioético de la persona, prevención sanitaria, acompañamiento humanizado y postas de salud comunitaria.",
    presentacion:
      "El Área de Salud convoca a futuros médicos, enfermeros, kinesiólogos, nutricionistas, odontólogos y farmacéuticos. Inspirados en el valor incondicional de la vida, llevamos atención primaria, educación para la salud y escucha compasiva a familias y personas en contextos de alta vulnerabilidad.",
    queHacemos: [
      "Organización y atención de postas de salud primaria en Manos a la Obra.",
      "Campañas de prevención de enfermedades, hábitos saludables y nutrición familiar.",
      "Talleres de higiene bucal y controles pediátricos en conjunto con centros de salud.",
      "Reflexión bioética sobre el ejercicio humanizado de la medicina y las ciencias de la salud."
    ],
    carreras: [
      "Medicina",
      "Enfermería",
      "Kinesiología",
      "Nutrición",
      "Odontología",
      "Farmacia",
      "Bioquímica"
    ],
    bannerImg: "/images/areas/banner-salud.jpeg",
    whatsappUrl:
      "https://chat.whatsapp.com/JLTcLcIfkxpA2NNbWNu5hD?s=cl&p=i&mlu=4&ilr=4",
    referentes: [
      {
        nombre: "Referente Salud",
        rol: "Coordinador de Área",
        carrera: "Estudiante de Medicina",
        frase:
          "Cuidar la salud con mirada integral es abrazar a la persona en cuerpo y espíritu.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Salud",
        rol: "Equipo de Animación",
        carrera: "Estudiante de Enfermería",
        frase:
          "Acompañar el dolor con presencia atenta y ternura es el corazón de nuestra vocación.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  },
  {
    slug: "psico-educacion",
    nombre: "PSICO-EDUCACIÓN",
    comunidad: "Comunidad de Estudiantes",
    lema: "Contención emocional, fortalecimiento de vínculos, apoyo escolar y talleres formativos.",
    descripcionCorta:
      "Contención emocional, fortalecimiento de vínculos, apoyo escolar y talleres psicoeducativos para niños, jóvenes y familias.",
    presentacion:
      "El Área de Psico-Educación nuclea a estudiantes de psicología, psicopedagogía y ciencias de la educación. Trabajamos en el desarrollo integral de la persona humana, ofreciendo espacios de escucha activa, fortalecimiento del aprendizaje escolar y herramientas socioemocionales para infancias y familias.",
    queHacemos: [
      "Espacios de apoyo escolar, estímulo de la lectocomprensión y actividades lúdicas.",
      "Talleres de manejo de emociones, prevención de consumos y habilidades vinculares.",
      "Charlas universitarias sobre manejo del estrés y la ansiedad previa a exámenes.",
      "Acompañamiento a padres y docentes de comunidades en situación de vulnerabilidad."
    ],
    carreras: [
      "Psicología",
      "Psicopedagogía",
      "Ciencias de la Educación",
      "Profesorados"
    ],
    bannerImg: "/images/areas/banner-psico-educacion.jpeg",
    whatsappUrl:
      "https://chat.whatsapp.com/IyyZGYQ4SUf9wki3T2SJnJ?s=sh&p=a&mlu=4&ilr=4&iam=2",
    referentes: [
      {
        nombre: "Referente Psico-Educación",
        rol: "Coordinador de Área",
        carrera: "Estudiante de Psicología",
        frase:
          "Crear espacios de escucha y empatía es sembrar esperanza en cada persona.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Psico-Educación",
        rol: "Equipo de Animación",
        carrera: "Estudiante de Ciencias de la Educación",
        frase:
          "Educar con amor es abrir puertas para que cada chico descubra su potencial.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  },
  {
    slug: "jovenes-profesionales",
    nombre: "JÓVENES PROFESIONALES",
    comunidad: "Comunidad de Jóvenes Profesionales",
    lema: "Acompañamiento, espiritualidad y fraternidad en la transición e inicio del ejercicio profesional.",
    descripcionCorta:
      "Acompañamos a estudiantes en etapa de tesis, prácticas profesionales finales y graduados recientes en su inserción laboral.",
    presentacion:
      "La Comunidad de Jóvenes Profesionales de la PUM brinda un espacio de discernimiento, fraternidad y contención para quienes se encuentran finalizando sus carreras (tesis, prácticas) o dando sus primeros pasos en el mundo laboral. Buscamos iluminar la vida laboral desde los valores del Evangelio, promoviendo un liderazgo ético y con impacto social.",
    queHacemos: [
      "Encuentros mensuales de espiritualidad, discernimiento profesional y comunidad.",
      "Charlas con graduados y líderes de sectores sobre ética profesional y liderazgo.",
      "Mentorías para la preparación de currículums, entrevistas y transición a la vida laboral.",
      "Participación activa como tutores y profesionales de apoyo en proyectos comunitarios."
    ],
    carreras: [
      "Graduados recientes de todas las disciplinas",
      "Estudiantes en etapa de tesis final",
      "Prácticas profesionales",
      "Jóvenes insertándose en el mundo del trabajo"
    ],
    bannerImg: "/images/areas/banner-jovenes-profesionales.jpeg",
    whatsappUrl: "https://chat.whatsapp.com/IFcWlyNdUdS0PNepeeO86T",
    instagramUrl: "https://www.instagram.com/pu.mendoza/",
    referentes: [
      {
        nombre: "Referente Profesionales",
        rol: "Coordinador de Comunidad",
        carrera: "Licenciado / Joven Profesional",
        frase:
          "Vivir el trabajo como vocación de servicio y testimonio en el día a día.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      },
      {
        nombre: "Co-Referente Profesionales",
        rol: "Equipo de Animación",
        carrera: "Graduada reciente",
        frase:
          "Construir una red de profesionales comprometidos con la ética y el bien común.",
        instagram: "https://www.instagram.com/pu.mendoza/"
      }
    ]
  }
];

export function getAreaBySlug(slug: string): AreaData | undefined {
  return areas.find((a) => a.slug === slug);
}
