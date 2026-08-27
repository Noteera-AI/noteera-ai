import express from "express";
import sharp from "sharp";
import cors from "cors";
import jsQR from "jsqr";
import crypto from "crypto";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import Tesseract from "tesseract.js";
import { createRequire } from "module";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const noteeraMarkPath = path.join(
  __dirname,
  "..",
  "public",
  "noteera-mark.png"
);
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
dotenv.config();
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  projectId: "noteera-a85f1",
});
const db = getFirestore();
const app = express();
function createNoteeraSignature() {
  return crypto
    .createHmac("sha256", process.env.NOTEERA_QR_SECRET)
    .update("NOTEERA-OFFICIAL")
    .digest("hex");
}

function verifyNoteeraQr(qrData) {
  try {
    const signature = createNoteeraSignature();

    const expectedQr =
      `https://noteera-ai-hqyd.vercel.app/verify?sig=${signature}`;

    return qrData === expectedQr;
  } catch (error) {
    console.error("NOTEERA QR VERIFY ERROR:", error);
    return false;
  }
}
app.use(
  cors({
    origin: [
  "https://noteera-ai-hqyd.vercel.app",
  "https://noteera-ai-hqyd-git-main-ahmed-c2bf.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({
    message: "Noteera AI Server يعمل بنجاح 🚀",
  });
});

app.post(
  "/ask",
  (req, res, next) => {
    console.log("✅ وصل /ask قبل multer");
    next();
    },
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("✅ وصل طلب /ask", req.files);
      const question = req.body?.question || "";

      const uploadedFile =
        req.files?.file?.[0] || req.files?.image?.[0];

      let extractedText = "";
      let isPdf = false;
      let isImageFile = false;
      let base64Image = "";

      if (uploadedFile) {
        const fileName = uploadedFile.originalname.toLowerCase();
const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

if (!allowedTypes.includes(uploadedFile.mimetype)) {
  return res.status(400).json({
    answer: "الملف غير مدعوم. ارفع صورة أو PDF فقط 💙",
  });
}
        isPdf =
          uploadedFile.mimetype === "application/pdf" ||
          fileName.endsWith(".pdf");

        isImageFile = uploadedFile.mimetype.startsWith("image/");

        if (isPdf) {
          const pdf = await pdfParse(uploadedFile.buffer);
          extractedText = pdf.text || "";
        } else if (isImageFile) {
          base64Image = uploadedFile.buffer.toString("base64");

          extractedText = "";
        }
      }
const MAX_TEXT_CHARS = 8000;
const safeExtractedText = extractedText.slice(0, MAX_TEXT_CHARS);
      const input = [];
input.push({
  role: "developer",
  content: [
    {
      type: "input_text",
      text: `
أنت "مساعد Noteera" 🤖، مساعد ذكي داخل مشروع Noteera الذي طوّره أحمد فاضل خلف.

إذا سألك المستخدم: "من أنت؟" أو "منو انت؟" أو سؤال مشابه، جاوبه:
"أنا مساعد Noteera 🤖، مساعد ذكي ضمن مشروع Noteera الذي طوّره أحمد فاضل خلف. مهمتي مساعدتك في الدراسة، شرح الأسئلة، حل المشكلات، وتنظيم أفكارك بطريقة سهلة وواضحة. شلون أگدر أساعدك اليوم؟ 😊"

لا تقل إنك أنت من طوّرت Noteera، ولا تنسب تطوير المشروع إلى شركة أخرى.

احچي باللهجة العراقية البسيطة، وخلي إجاباتك واضحة ومختصرة.
      `,
    },
  ],
});
      if (question.trim()) {
        input.push({
          role: "user",
          content: [
            {
              type: "input_text",
              text: question,
            },
          ],
        });
      }

      if (uploadedFile) {
        input.push({
          role: "user",
          content: [
            ...(isImageFile
              ? [
                  {
                    type: "input_image",
                    image_url: `data:${uploadedFile.mimetype};base64,${base64Image}`,
                  },
                ]
              : []),
            {
              type: "input_text",
              text: `
            
PDF أو النص المستخرج من الملف:
${safeExtractedText}

إذا كان النص واضحاً فاعتمد عليه أولاً ثم استخدم الصورة للتأكد.
أنت مساعد Noteera، مساعد دراسي عراقي.

أسلوبك:
- احچي باللهجة العراقية البسيطة.
- لا تستخدم كلمات معقدة.
- لا تطول بالإجابة.

قواعد مهمة جداً:

إذا الصورة مو واضحة:
- لا تخمن أبداً.
- كل للمستخدم:
"📸 الصورة مو واضحة، جرّب صوّرها مرة ثانية وخلي الورقة قريبة من الكاميرا."

إذا الصورة سؤال اختيار متعدد:
رتب الجواب بهذا الشكل:

💙 Noteera

📖 السؤال:
(اكتب السؤال)

✅ الجواب:
(الجواب الصحيح فقط)

💡 ليش؟
اشرح السبب بسطر أو سطرين.

🎯 تلميحة:
اذكر ملاحظة تساعد الطالب بالامتحان.

إذا الصورة صفحة من كتاب:

💙 Noteera

📚 عنوان الدرس

📝 شنو يحچي الدرس؟

📌 أهم النقاط

💡 مثال بسيط

🎯 شلون ممكن يجي بالامتحان؟

إذا الصورة مسألة رياضيات:

💙 Noteera

📖 المطلوب

🧮 الحل خطوة بخطوة

✅ الجواب النهائي

💡 ملاحظة تساعد الطالب.

إذا كانت الصورة تحتوي على حل جاهز أو جواب مكتوب:
- لا تعيد حل السؤال من البداية.
- اشرح الحل الموجود داخل الصورة خطوة بخطوة.
- إذا وجدت نتيجة نهائية مكتوبة فلا تغيّرها.

إذا كانت الصورة تحتوي على جدول:
- اقرأ الجدول كاملاً.
- اشرح كل عمود.
- اشرح كل صف.
- لا تتجاهل أي رقم واضح.

إذا كانت الصورة صفحة محاسبة:
رتب الجواب بهذا الشكل:

💙 Noteera

📖 عنوان الموضوع

📌 المطلوب

📊 شرح القيود أو الجدول

🧮 شرح العمليات الحسابية خطوة بخطوة

✅ النتيجة الموجودة في الدفتر

💡 ملاحظة تساعد الطالب.
طريقة عرض الجواب دائماً:

ابدأ دائماً بـ:
💙 Noteera

بعدها اختار الشكل المناسب حسب نوع الورقة:

إذا الورقة درس أو شرح:
📚 عنوان الدرس
📝 شرح مبسط
📌 أهم النقاط
💡 مثال بسيط
🎯 شلون يجي بالامتحان؟

إذا الورقة مسألة:
📖 المطلوب
🧮 الحل خطوة بخطوة
✅ الجواب النهائي
💡 ملاحظة مهمة

إذا الورقة جدول:
📊 شرح الجدول
📌 معنى الأعمدة
🔢 شرح الأرقام المهمة
✅ الخلاصة

إذا الورقة محاسبة:
📖 عنوان الموضوع
📌 المطلوب
📊 شرح القيود أو الجدول
🧮 شرح العمليات الحسابية
✅ النتيجة
💡 ملاحظة امتحانية

لا تختم بعبارة "اكتبها إلي".
إذا احتاج الطالب شرح أكثر، قل:
"تحتاج شرح أكثر؟ ارفع ورقة ثانية توضّح النقطة 💙"
إذا كانت الصورة تحتوي على نصوص مكتوبة بخط اليد:
- حاول قراءتها.
- إذا كانت غير واضحة، قل للمستخدم يصورها أوضح.
مهم:
- إذا أرسل الطالب صورة أو PDF فلا تطلب منه إعادة كتابة محتواها، وحاول فهمها مباشرة.
- التطبيق يقبل سؤالاً مكتوباً أو صورة أو PDF.
- إذا احتاج الطالب شرح أكثر، قل له:
"تحتاج شرح أكثر؟ ارفع ورقة ثانية توضّح النقطة 💙"
`,
            },
          ],
        });
      }

      if (input.length === 0) {
        return res.status(400).json({
          answer: "يرجى كتابة سؤال أو اختيار صورة.",
        });
      }
      console.log("✅ وصلنا قبل طلب OpenAI");
console.time("AI_ANALYSIS");
      const response = await openai.responses.create({
        model: "gpt-4.1",
        input,
      });
console.timeEnd("AI_ANALYSIS");
console.log("✅ رجع الرد من OpenAI");
      res.json({
        answer: response.output_text,
      });
    } catch (error) {
      console.error("❌ ASK ERROR:", error);
      if (error.code === "LIMIT_FILE_SIZE") {
  return res.status(400).json({
    answer: "📄 الملف كبير هواية. جرّب ارفع صورة أو PDF حجمه أقل من 10MB.",
  });
}
      console.error(error);

      res.status(500).json({
        answer: "حدث خطأ في الخادم",
      });
    }
  }
);
async function readQrFromBuffer(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const code = jsQR(
    new Uint8ClampedArray(data),
    info.width,
    info.height
  );

  return code?.data || null;
}
app.post("/ocr", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        text: "ماكو صورة مرفوعة",
      });
    }
const qrData = await readQrFromBuffer(req.file.buffer);

if (!qrData) {
  return res.status(403).json({
    verified: false,
    text: "❌ تعذّر التحقق من الورقة. تأكد أن ختم Noteera ظاهر بوضوح ثم حاول مرة أخرى.",
  });
}
if (!verifyNoteeraQr(qrData)) {
  return res.status(403).json({
    verified: false,
    text: "❌ تعذّر التحقق من الورقة. تأكد أن ختم Noteera ظاهر بوضوح ثم حاول مرة أخرى.",
  });
}

console.log("✅ NOTEERA QR VERIFIED:", qrData);
    const enhancedImage = await sharp(req.file.buffer)
  .grayscale()
  .normalize()
  .sharpen()
  .resize({
    width: 2000,
    withoutEnlargement: false,
  })
  .jpeg({ quality: 95 })
  .toBuffer();

const base64Image = enhancedImage.toString("base64");
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
             text: `
حوّل محتوى الصورة إلى صفحة رقمية مرتبة ومضغوطة وقابلة للطباعة مثل مستند Word.

القواعد:
- حافظ على نفس لغة الورقة.
- لا تترجم.
- لا تختصر ولا تحذف أي معلومة.
- انسخ جميع الأرقام والقيم كما تظهر في الصورة حرفياً، ولا تغيّر أي رقم.
- لا تحسب ولا تصحح ولا تستنتج المجاميع أو القيم من نفسك، حتى لو بدا لك أن الرقم الموجود في الصورة غير صحيح.
- إذا كان أي رقم أو كلمة غير واضحين في الصورة، لا تخمّنهم ولا تستنتجهم من بقية القيم.
- عند عدم القدرة على قراءة قيمة بثقة، اكتب [غير واضح] مكانها كما هي.
- حافظ على ترتيب المحتوى من أعلى الصفحة إلى أسفلها.
- ميّز العناوين والفقرات والتعدادات.
- إذا توجد جداول، أعد بناءها كجداول HTML حقيقية باستخدام table و tr و th و td.
- حافظ على اتجاه الجدول كما يظهر في الصورة الأصلية تماماً.
- في الجداول العربية، لا تعكس ترتيب الأعمدة من عندك.
- العمود الموجود أقصى يمين الصورة يجب أن يبقى أقصى يمين الجدول الناتج، والذي يليه يبقى بعده بنفس الترتيب.
- لا تعيد ترتيب الصفوف أو الأعمدة لتحسين الشكل أو حسب المعنى.
- إذا كان اتجاه الجدول من اليمين إلى اليسار، استخدم dir="rtl" على عنصر table أو الحاوية المناسبة.
- إذا توجد مسائل أو معادلات رياضية، حافظ على الرموز والأرقام وترتيب المعادلة قدر الإمكان.
- إذا توجد أسئلة وأجوبة أو قوائم مرقمة، استخدم ol و ul و li.
- استخدم p للفقرات و h2 أو h3 للعناوين.
- اجعل التنسيق مضغوطاً مثل مستند Word عادي، بدون فراغات كبيرة بين الأسطر أو الفقرات.
- ممنوع استخدام <br><br>.
- استخدم <br> فقط عند الضرورة القصوى داخل نفس الفقرة.
- لا تضف أسطر فارغة أو مسافات عمودية غير موجودة فعلاً في المحتوى.
- لا تضع line-height أو margin أو padding كـ inline style داخل HTML.
- لا تضع font-size أو font-family كـ inline style.
- إذا يوجد رسم أو مخطط بسيط، مثّله قدر الإمكان باستخدام HTML أو SVG بسيط.
- لا تضف شرحاً من عندك.
- لا تكتب Markdown ولا علامات \`\`\`.
- أرجع فقط HTML صالح يوضع مباشرة داخل div.
`,
            },
            {
              type: "input_image",
              image_url: `data:${req.file.mimetype};base64,${base64Image}`,
            },
          ],
        },
      ],
    });

    const firstPass = response.output_text || "";

console.log("OCR FIRST PASS:", firstPass);

console.log("OCR VERIFIED:", firstPass);
res.json({
  text: firstPass,
});
  } catch (error) {
    console.error("OCR ERROR:", error);

    res.status(500).json({
      text: "صار خطأ أثناء تحويل الكتابة إلى نص رقمي",
    });
  }
});

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        translation: "النص أو اللغة غير موجودة",
      });
    }

    const languages = {
      ar: "Arabic",
      en: "English",
      fr: "French",
      de: "German",
      es: "Spanish",
      tr: "Turkish",
    };

    const languageName = languages[targetLanguage] || "English";

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: `
Translate the following text into ${languageName}.

Rules:
- Preserve the meaning exactly.
- Preserve headings and emojis.
- Do not add explanations.
- Return only the translated text.

Text:
${text}
`,
    });

    res.json({
      translation: response.output_text,
    });
  } catch (error) {
    console.error("Translation error:", error);

    res.status(500).json({
      translation: "صار خطأ بالترجمة، جرّب مرة ثانية.",
    });
  }
});
app.get("/verify-noteera", (req, res) => {
  try {
    const { sig } = req.query;

    if (!sig) {
      return res.status(400).json({
        verified: false,
      });
    }

    const expectedSignature = createNoteeraSignature();

    const isValid = crypto.timingSafeEqual(
      Buffer.from(sig, "hex"),
      Buffer.from(expectedSignature, "hex")
    );

    if (!isValid) {
      return res.status(403).json({
        verified: false,
      });
    }

    return res.json({
      verified: true,
    });
  } catch (error) {
    console.error("VERIFY NOTEERA ERROR:", error);

    return res.status(500).json({
      verified: false,
    });
  }
});
app.get("/noteera-qr-link", (req, res) => {
  try {
    const signature = createNoteeraSignature();

    const qrUrl =
      `https://noteera-ai-hqyd.vercel.app/verify?sig=${signature}`;

    return res.json({
      success: true,
      qrUrl,
    });
  } catch (error) {
    console.error("NOTEERA QR LINK ERROR:", error);

    return res.status(500).json({
      success: false,
    });
  }
});

app.post("/create-subscription", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

if (!authHeader?.startsWith("Bearer ")) {
  return res.status(401).json({
    success: false,
    message: "غير مصرح",
  });
}

const idToken = authHeader.split("Bearer ")[1];

const decodedToken = await getAuth().verifyIdToken(idToken);
const userId = decodedToken.uid;
const userRef = db.collection("users").doc(userId);
const userDoc = await userRef.get();

if (userDoc.exists) {
  const userData = userDoc.data();
  const currentSub = userData.subscription;

  if (
    currentSub?.plan === "plus" &&
    currentSub?.expiresAt &&
    currentSub.expiresAt.toDate() <= new Date()
  ) {
    await userRef.update({
      subscription: {
        plan: "free",
        status: "expired",
      },
    });
  }
}
await db.collection("users").doc(userId).update({
  subscription: {
  plan: "plus",
  status: "active",
  price: 5900,
  currency: "IQD",
  startedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
},
});
    res.json({
      success: true,
      plan: "plus",
      price: 5900,
      currency: "IQD",
      message: "تم تفعيل اشتراك Noteera Plus لمدة 30 يوم ✅",
    });
  } catch (error) {
    console.error("Subscription error:", error);

    res.status(500).json({
      success: false,
      message: "صار خطأ بإنشاء الاشتراك",
    });
  }
});
const PORT = 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("close", () => {
  console.log("SERVER CLOSED");
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error);
});

server.ref();