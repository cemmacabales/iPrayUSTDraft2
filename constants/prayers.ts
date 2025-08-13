import { PrayerCategory, VerseOfTheDay } from '../types';

export const PRAYER_CATEGORIES: PrayerCategory[] = [
  {
    id: 'introductory',
    title: 'Introductory Content',
    description: 'Cover Page, Brief Catechesis on the Liturgy, Mass, and the New Roman Missal, and Guide to People\'s Prayers and Responses.',
    icon: 'book-outline',
    prayers: [
      {
        id: 'intro-1',
        title: 'Welcome to iPrayUST',
        content: 'Welcome to the digital prayer companion for the University of Santo Tomas community. This app serves as your spiritual guide, offering prayers, devotions, and resources to support your faith journey.',
        category: 'introductory',
        description: 'A warm welcome message for UST students and faculty',
      },
      {
        id: 'intro-2',
        title: 'Brief Catechesis on the Liturgy',
        content: 'The liturgy is the public worship of the Church. It is the work of Christ the Priest and of His Body, the Church. Through the liturgy, we participate in the mystery of salvation.',
        category: 'introductory',
        description: 'Understanding the importance of liturgical worship',
      },
    ]
  },
  {
    id: 'devotional',
    title: 'Devotional Prayers',
    description: 'Angelus, Regina Coeli, Prayers Before/After Mass, Before Study, Before Exams.',
    icon: 'heart',
    prayers: [
      {
        id: 'angelus',
        title: 'The Angelus',
        content: `V. The Angel of the Lord declared unto Mary.
R. And she conceived of the Holy Spirit.

Hail Mary, full of grace, the Lord is with thee; blessed art thou among women and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.

V. Behold the handmaid of the Lord.
R. Be it done unto me according to thy word.

Hail Mary...

V. And the Word was made flesh.
R. And dwelt among us.

Hail Mary...

V. Pray for us, O holy Mother of God.
R. That we may be made worthy of the promises of Christ.

Let us pray:
Pour forth, we beseech thee, O Lord, thy grace into our hearts; that we, to whom the incarnation of Christ, thy Son, was made known by the message of an angel, may by his passion and cross be brought to the glory of his resurrection, through the same Christ our Lord. Amen.`,
        category: 'devotional',
        description: 'Traditional prayer commemorating the Annunciation',
      },
      {
        id: 'before-study',
        title: 'Prayer Before Study',
        content: `Come, Holy Spirit, Divine Creator, true source of light and fountain of wisdom! Pour forth your brilliance upon my intellect, dissipate the darkness which covers me, that of sin and of ignorance.

Grant me a penetrating mind to understand, a retentive memory, method and ease in learning, the lucidity to comprehend, and abundant grace in expressing myself.

Guide the beginning of my work, direct its progress, and bring it to successful completion. This I ask through Jesus Christ, true God and true man, living and reigning with You and the Father, forever and ever. Amen.`,
        category: 'devotional',
        description: 'Prayer for academic success and wisdom',
      },
      {
        id: 'before-exams',
        title: 'Prayer Before Exams',
        content: `Lord Jesus, I ask for Your help as I prepare for my exams. Give me clarity of mind and calmness of heart. Help me to recall all that I have studied and to express it clearly.

Grant me wisdom to understand the questions and the ability to answer them well. May Your peace fill my heart and mind, and may I trust in Your guidance throughout this exam.

I offer this exam to You, Lord, and I pray that my efforts may bring glory to Your name. Amen.`,
        category: 'devotional',
        description: 'Prayer for exam success and peace of mind',
      },
    ]
  },
  {
    id: 'protection',
    title: 'Protection & Intercessory Prayers',
    description: 'Guardian Angel, St. Michael the Archangel, St. Joseph, St. Dominic, Prayer for Deliverance.',
    icon: 'shield',
    prayers: [
      {
        id: 'guardian-angel',
        title: 'Prayer to Guardian Angel',
        content: `Angel of God, my guardian dear,
To whom God's love commits me here,
Ever this day be at my side,
To light and guard, to rule and guide. Amen.`,
        category: 'protection',
        description: 'Traditional prayer to one\'s guardian angel',
      },
      {
        id: 'st-michael',
        title: 'Prayer to St. Michael the Archangel',
        content: `St. Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray, and do thou, O Prince of the heavenly hosts, by the power of God, cast into hell Satan, and all the evil spirits, who wander through the world seeking the ruin of souls. Amen.`,
        category: 'protection',
        description: 'Powerful prayer for protection against evil',
      },
      {
        id: 'st-joseph',
        title: 'Prayer to St. Joseph',
        content: `O St. Joseph, whose protection is so great, so strong, so prompt before the throne of God, I place in you all my interests and desires. O St. Joseph, do assist me by your powerful intercession, and obtain for me from your divine Son all spiritual blessings, through Jesus Christ, our Lord. So that, having engaged here below your heavenly power, I may offer my thanksgiving and homage to the most loving of Fathers. O St. Joseph, I never weary contemplating you, and Jesus asleep in your arms; I dare not approach while He reposes near your heart. Press Him in my name and kiss His fine head for me and ask him to return the Kiss when I draw my dying breath. St. Joseph, Patron of departing souls - Pray for me. Amen.`,
        category: 'protection',
        description: 'Prayer to St. Joseph for protection and intercession',
      },
    ]
  },
  {
    id: 'consecrations',
    title: 'Consecrations',
    description: 'Sacred Heart of Jesus and the Immaculate Heart of Mary, Act of Reparation to the Sacred Heart.',
    icon: 'heart-circle',
    prayers: [
      {
        id: 'sacred-heart',
        title: 'Consecration to the Sacred Heart of Jesus',
        content: `O Sacred Heart of Jesus, I consecrate myself to You today and forever. I give You my body, my soul, my life, my death, and all that will follow. I place all my trust in You, and I promise to love You and honor You all the days of my life.

I promise to live as a faithful child of the Church and to do all in my power to promote the glory of God and the salvation of souls. I promise to receive Holy Communion frequently and to spend one hour in adoration before the Blessed Sacrament as often as possible.

O Sacred Heart of Jesus, have mercy on me and on the whole world. Amen.`,
        category: 'consecrations',
        description: 'Complete consecration to the Sacred Heart of Jesus',
      },
      {
        id: 'immaculate-heart',
        title: 'Consecration to the Immaculate Heart of Mary',
        content: `O Immaculate Heart of Mary, I consecrate myself to you today and forever. I give you my heart, my soul, my life, my death, and all that will follow. I place all my trust in you, and I promise to love you and honor you all the days of my life.

I promise to live as a faithful child of the Church and to do all in my power to promote the glory of God and the salvation of souls. I promise to pray the Rosary daily and to make sacrifices for the conversion of sinners.

O Immaculate Heart of Mary, pray for me and for the whole world. Amen.`,
        category: 'consecrations',
        description: 'Complete consecration to the Immaculate Heart of Mary',
      },
    ]
  },
  {
    id: 'marian',
    title: 'Marian Devotions',
    description: 'Our Lady of the Holy Rosary.',
    icon: 'flower',
    prayers: [
      {
        id: 'rosary-intro',
        title: 'How to Pray the Rosary',
        content: `The Rosary is a powerful prayer that combines vocal prayer with meditation on the mysteries of our salvation. Begin with the Sign of the Cross, then pray the Apostles' Creed, Our Father, three Hail Marys, and Glory Be. Then pray five decades, each consisting of one Our Father, ten Hail Marys, and one Glory Be, while meditating on the appropriate mystery.

The Joyful Mysteries (Monday & Saturday): Annunciation, Visitation, Nativity, Presentation, Finding in the Temple
The Sorrowful Mysteries (Tuesday & Friday): Agony in the Garden, Scourging, Crowning with Thorns, Carrying the Cross, Crucifixion
The Glorious Mysteries (Wednesday & Sunday): Resurrection, Ascension, Descent of the Holy Spirit, Assumption, Coronation
The Luminous Mysteries (Thursday): Baptism of Jesus, Wedding at Cana, Proclamation of the Kingdom, Transfiguration, Institution of the Eucharist`,
        category: 'marian',
        description: 'Guide to praying the Holy Rosary',
      },
    ]
  },
  {
    id: 'other',
    title: 'Other Important Prayers',
    description: 'Confession Guide, Act of Contrition, Dominican Blessing, Emergency Baptism.',
    icon: 'close',
    prayers: [
      {
        id: 'act-contrition',
        title: 'Act of Contrition',
        content: `O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve with the help of Thy grace to sin no more and to avoid the near occasion of sin. Amen.`,
        category: 'other',
        description: 'Traditional Act of Contrition for confession',
      },
      {
        id: 'dominican-blessing',
        title: 'Dominican Blessing',
        content: `May God the Father bless us.
May God the Son heal us.
May God the Holy Spirit enlighten us.
May the Holy Trinity guard our bodies, save our souls, and bring us safely to the heavenly country, where He lives and reigns forever and ever. Amen.`,
        category: 'other',
        description: 'Traditional Dominican blessing',
      },
    ]
  },
];

export const VERSE_OF_THE_DAY: VerseOfTheDay = {
  id: 'votd-1',
  verse: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
  reference: 'Jeremiah 29:11',
  date: new Date().toISOString().split('T')[0],
};
