import type { InstitutionType, ReviewerIdentity, ReviewStatus } from "@prisma/client";

export type PublicDistrict = {
  name: string;
  slug: string;
  region: "香港島" | "九龍" | "新界";
};

export type PublicCategory = {
  name: string;
  slug: string;
};

export type PublicReview = {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  status: ReviewStatus;
  identity: ReviewerIdentity;
  reviewerName: string;
  breakdown: {
    teachingQuality: number;
    curriculum: number;
    teacherProfessionalism: number;
    learningEnvironment: number;
    communication: number;
    valueForMoney: number;
    studentEngagement: number;
  };
};

export type PublicInstitution = {
  id: string;
  name: string;
  slug: string;
  type: InstitutionType;
  district: PublicDistrict;
  categories: PublicCategory[];
  overview: string;
  shortDescription: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  tuitionFee?: string;
  sourceUrl: string;
  sourceLabel: string;
  coverImage: string;
  photos: { url: string; alt: string }[];
  reviews: PublicReview[];
};

export const districts: PublicDistrict[] = [
  { name: "中西區", slug: "central-and-western", region: "香港島" },
  { name: "灣仔", slug: "wan-chai", region: "香港島" },
  { name: "南區", slug: "southern", region: "香港島" },
  { name: "九龍城", slug: "kowloon-city", region: "九龍" },
  { name: "油尖旺", slug: "yau-tsim-mong", region: "九龍" },
  { name: "沙田", slug: "sha-tin", region: "新界" },
  { name: "西貢", slug: "sai-kung", region: "新界" },
];

export const categories: PublicCategory[] = [
  { name: "STEM", slug: "stem" },
  { name: "英文", slug: "english" },
  { name: "中文", slug: "chinese" },
  { name: "數學", slug: "mathematics" },
  { name: "編程", slug: "coding" },
  { name: "機械人", slug: "robotics" },
  { name: "Playgroup", slug: "playgroup" },
  { name: "面試準備", slug: "interview-preparation" },
  { name: "IB", slug: "ib" },
  { name: "DSE", slug: "dse" },
];

const byDistrict = Object.fromEntries(districts.map((district) => [district.slug, district]));
const byCategory = Object.fromEntries(categories.map((category) => [category.slug, category]));

function review(
  id: string,
  rating: number,
  identity: ReviewerIdentity,
  reviewerName: string,
  title: string,
  content: string,
): PublicReview {
  return {
    id,
    rating,
    title,
    content,
    createdAt: "2026-05-18",
    status: "PUBLISHED",
    identity,
    reviewerName,
    breakdown: {
      teachingQuality: rating,
      curriculum: Math.max(1, rating - 1),
      teacherProfessionalism: rating,
      learningEnvironment: rating,
      communication: Math.max(1, rating - 1),
      valueForMoney: Math.max(1, rating - 1),
      studentEngagement: rating,
    },
  };
}

export const institutions: PublicInstitution[] = [
  {
    id: "dbs",
    name: "拔萃男書院",
    slug: "diocesan-boys-school",
    type: "SCHOOL",
    district: byDistrict["kowloon-city"],
    categories: [byCategory.dse, byCategory.ib, byCategory.stem, byCategory.english],
    overview:
      "拔萃男書院是香港歷史悠久的男校之一，平台只展示公開可核查的基本資料。評論區聚焦家長、教師及校友的已驗證經驗。",
    shortDescription: "九龍傳統男校，提供本地及國際課程相關學習路徑。",
    address: "九龍旺角亞皆老街 131 號",
    website: "https://www.dbs.edu.hk/",
    tuitionFee: "請以學校官方公布為準",
    sourceUrl: "https://www.dbs.edu.hk/",
    sourceLabel: "學校官方網站",
    coverImage: "/images/campus-night-01.png",
    photos: [{ url: "/images/campus-night-01.png", alt: "香港校園夜景概念圖" }],
    reviews: [
      review("dbs-r1", 5, "ALUMNI", "已驗證校友", "重視自主學習", "老師和同學都鼓勵學生建立長遠目標，校園活動選擇多，適合主動型學生。"),
      review("dbs-r2", 4, "VERIFIED_PARENT", "已驗證家長", "資訊透明度高", "家校溝通比想像中有系統，課業節奏較快，需要家庭配合時間管理。"),
    ],
  },
  {
    id: "spcc",
    name: "聖保羅男女中學",
    slug: "st-pauls-co-educational-college",
    type: "SCHOOL",
    district: byDistrict["central-and-western"],
    categories: [byCategory.dse, byCategory.ib, byCategory.english, byCategory.chinese],
    overview:
      "聖保羅男女中學位於港島中西區，是香港具代表性的直資中學之一。平台資料以官方網站及公開資料為基礎。",
    shortDescription: "港島中西區直資學校，學術及全人發展並重。",
    address: "香港麥當勞道 33 號",
    website: "https://www.spcc.edu.hk/",
    tuitionFee: "請以學校官方公布為準",
    sourceUrl: "https://www.spcc.edu.hk/",
    sourceLabel: "學校官方網站",
    coverImage: "/images/campus-night-02.png",
    photos: [{ url: "/images/campus-night-02.png", alt: "港島校園概念圖" }],
    reviews: [
      review("spcc-r1", 5, "VERIFIED_TEACHER", "已驗證教師", "學生投入度很高", "學生普遍準備充足，跨學科活動有助培養表達和研究能力。"),
    ],
  },
  {
    id: "wyk",
    name: "華仁書院（九龍）",
    slug: "wah-yan-college-kowloon",
    type: "SCHOOL",
    district: byDistrict["yau-tsim-mong"],
    categories: [byCategory.dse, byCategory.chinese, byCategory.english],
    overview:
      "華仁書院（九龍）是油尖旺區男校，平台收錄其公開基本資料，並以已驗證身份評論補充實際就讀觀察。",
    shortDescription: "油尖旺區傳統男校，重視品格及學術基礎。",
    address: "九龍窩打老道 56 號",
    website: "https://www.wyk.edu.hk/",
    tuitionFee: "請以學校官方公布為準",
    sourceUrl: "https://www.wyk.edu.hk/",
    sourceLabel: "學校官方網站",
    coverImage: "/images/campus-night-03.png",
    photos: [{ url: "/images/campus-night-03.png", alt: "九龍校園概念圖" }],
    reviews: [
      review("wyk-r1", 4, "ALUMNI", "已驗證校友", "校風穩定", "學校氛圍較樸實，老師願意課後跟進，適合重視自律的學生。"),
    ],
  },
  {
    id: "hys",
    name: "協恩中學",
    slug: "heep-yunn-school",
    type: "SCHOOL",
    district: byDistrict["kowloon-city"],
    categories: [byCategory.dse, byCategory.stem, byCategory.english],
    overview:
      "協恩中學位於九龍城區，是香港知名女校。平台以來源連結記錄公開資料，評論需經身份驗證後發布。",
    shortDescription: "九龍城區女校，兼顧學術、體育和多元發展。",
    address: "九龍農圃道 1 號",
    website: "https://www.hys.edu.hk/",
    tuitionFee: "請以學校官方公布為準",
    sourceUrl: "https://www.hys.edu.hk/",
    sourceLabel: "學校官方網站",
    coverImage: "/images/campus-night-04.png",
    photos: [{ url: "/images/campus-night-04.png", alt: "女校校園概念圖" }],
    reviews: [
      review("hys-r1", 5, "VERIFIED_PARENT", "已驗證家長", "活動與學術平衡", "學校節奏明快，活動選項多，學生需要良好規劃。"),
    ],
  },
  {
    id: "cdnis",
    name: "加拿大國際學校",
    slug: "canadian-international-school-of-hong-kong",
    type: "SCHOOL",
    district: byDistrict.southern,
    categories: [byCategory.ib, byCategory.english, byCategory.stem],
    overview:
      "加拿大國際學校位於香港南區，提供國際課程。平台資料以學校官方網站為來源，費用及收生細節請以官方公布為準。",
    shortDescription: "南區國際學校，重視探究式學習及國際課程。",
    address: "香港仔南朗山道 36 號",
    website: "https://www.cdnis.edu.hk/",
    tuitionFee: "請以學校官方公布為準",
    sourceUrl: "https://www.cdnis.edu.hk/",
    sourceLabel: "學校官方網站",
    coverImage: "/images/campus-night-05.png",
    photos: [{ url: "/images/campus-night-05.png", alt: "國際學校校園概念圖" }],
    reviews: [
      review("cdnis-r1", 4, "EDUCATION_PROFESSIONAL", "教育專業人士", "探究式學習成熟", "課程設計鼓勵學生提出問題，家長需要投入參與學習溝通。"),
    ],
  },
  {
    id: "preface",
    name: "Preface Coding",
    slug: "preface-coding",
    type: "EDUCATION_CENTRE",
    district: byDistrict["wan-chai"],
    categories: [byCategory.coding, byCategory.stem, byCategory.robotics],
    overview:
      "Preface Coding 是香港科技教育機構，平台只展示能由機構網站佐證的基本資料，課程及校區以官方網站為準。",
    shortDescription: "科技及編程教育中心，提供不同年齡層的數碼學習課程。",
    address: "多個香港校區，請以機構官方網站為準",
    website: "https://www.preface.ai/",
    tuitionFee: "請以機構官方公布為準",
    sourceUrl: "https://www.preface.ai/",
    sourceLabel: "機構官方網站",
    coverImage: "/images/learning-lab-01.png",
    photos: [{ url: "/images/learning-lab-01.png", alt: "科技學習中心概念圖" }],
    reviews: [
      review("preface-r1", 4, "VERIFIED_PARENT", "已驗證家長", "課程感覺貼近科技趨勢", "導師能用生活例子解釋概念，小朋友對完成作品有成就感。"),
    ],
  },
  {
    id: "koding-kingdom",
    name: "Koding Kingdom",
    slug: "koding-kingdom",
    type: "EDUCATION_CENTRE",
    district: byDistrict["sha-tin"],
    categories: [byCategory.coding, byCategory.robotics, byCategory.stem],
    overview:
      "Koding Kingdom 提供兒童及青少年編程教育。平台以機構網站作為基本資料來源，實際課程、地點及學費需向機構確認。",
    shortDescription: "兒童及青少年編程課程，涵蓋創意科技學習。",
    address: "香港課程地點請以機構官方網站為準",
    website: "https://www.kodingkingdom.com/",
    tuitionFee: "請以機構官方公布為準",
    sourceUrl: "https://www.kodingkingdom.com/",
    sourceLabel: "機構官方網站",
    coverImage: "/images/learning-lab-02.png",
    photos: [{ url: "/images/learning-lab-02.png", alt: "編程學習中心概念圖" }],
    reviews: [
      review("kk-r1", 4, "VERIFIED_PARENT", "已驗證家長", "適合入門編程", "課程結構清晰，對初學學生較友善，作品導向令孩子較投入。"),
    ],
  },
  {
    id: "the-genius-workshop",
    name: "The Genius Workshop",
    slug: "the-genius-workshop",
    type: "EDUCATION_CENTRE",
    district: byDistrict["wan-chai"],
    categories: [byCategory.robotics, byCategory.stem, byCategory.coding],
    overview:
      "The Genius Workshop 提供 STEM、機械人及創科相關課程。平台以機構公開資料建立基本檔案，評論須經身份驗證。",
    shortDescription: "STEM 及機械人教育中心，適合探索式科技學習。",
    address: "香港課程地點請以機構官方網站為準",
    website: "https://www.geniusworkshop.com.hk/",
    tuitionFee: "請以機構官方公布為準",
    sourceUrl: "https://www.geniusworkshop.com.hk/",
    sourceLabel: "機構官方網站",
    coverImage: "/images/learning-lab-03.png",
    photos: [{ url: "/images/learning-lab-03.png", alt: "STEM 學習中心概念圖" }],
    reviews: [
      review("tgw-r1", 4, "REGISTERED_EDUCATOR", "註冊教育工作者", "活動設計完整", "課堂任務有清楚目標，能訓練學生拆解問題。"),
    ],
  },
];
