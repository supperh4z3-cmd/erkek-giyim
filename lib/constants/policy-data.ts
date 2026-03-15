export interface PolicySection {
    heading: string;
    content: string[];
}

export interface PolicyData {
    title: string;
    subtitle: string;
    sections: PolicySection[];
}

export const SHIPPING_POLICY_DATA: PolicyData = {
    title: "Kargo & Teslimat",
    subtitle: "Sokağın Ritmine Ayak Uydur. Hızlı ve Güvenilir Kurallar.",
    sections: [
        {
            heading: "Gönderim Süreleri",
            content: [
                "Tüm siparişler 1-3 iş günü içerisinde özenle hazırlanıp anlaşmalı kargo şirketine teslim edilir.",
                "Özel sezonluk (Drop) dönemlerinde veya indirim günlerinde yaşanabilecek yoğunluklardan dolayı bu süre 5 iş gününe kadar uzayabilir. Bu tarz durumlarda kargo süreci hakkında ayrıca e-posta bilgilendirmesi yapılır."
            ]
        },
        {
            heading: "Kargo Ücretleri",
            content: [
                "Türkiye (Yurtiçi) için belirlenen minimum sepet tutarının üzerindeki siparişlerde Kargo Ücretsizdir.",
                "Uluslararası (Yurtdışı) gönderimlerde kargo şirketi ve lokasyona göre ekstra masraflar alıcıya yansıtılacaktır. Şimdilik sadece Türkiye içine gönderim yapıyoruz."
            ]
        },
        {
            heading: "Teslimat Takibi",
            content: [
                "Siparişiniz depomuzdan çıktığı an, sistemimiz tarafından sizlere bir takip numarası içeren SMS ve Gönderim Onayı (e-posta) iletilecektir.",
                "Üyelik panelinizden de siparişinizin güncel durumunu anlık takip edebilirsiniz."
            ]
        }
    ]
};

export const RETURNS_POLICY_DATA: PolicyData = {
    title: "İade & Değişim",
    subtitle: "Taviz Yok, Bahane Yok. Adil İade Kuralları.",
    sections: [
        {
            heading: "Genel Şartlar",
            content: [
                "Ürünleri teslim aldığınız tarihten itibaren 14 gün içerisinde yasal cayma hakkınızı kullanabilirsiniz.",
                "İade edilecek veya değiştirilecek olan ürünlerin yıkanmamış, giyilmemiş, formunu kaybetmemiş ve zarar görmemiş olması kesin kuralımızdır.",
                "Orijinal fatura ve etiketlerin ürün üzerinde veya kutu içerisinde eksiksiz bulunması zorunludur."
            ]
        },
        {
            heading: "Değişim Şartları",
            content: [
                "Yanlış beden seçimi durumunda, ürün depomuzu ulaştıktan ve onayı yapıldıktan sonra ücretsiz beden değişimi sağlanır.",
                "Aynı ürünün farklı stili/rengi ile değişim talep edildiğinde stok durumuna göre süreç başlatılır."
            ]
        },
        {
            heading: "İade Süreci İşleyişi",
            content: [
                "Profilinize giriş yapıp siparişleriniz bölümünden 'İade Talebi' oluşturun.",
                "Size verilen müşteri no (iade kodu) ile beraber ürünü paketleyip anlaşmalı kargo şubesine bırakın.",
                "Ürün depomuza ulaşıp kalite-kontrol uzmanımız tarafından onaylandıktan sonra para iadeniz 3-7 iş günü içerisinde yapılmış oalcaktır."
            ]
        }
    ]
};

export interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ_DATA: FAQItem[] = [
    {
        question: "Chase & Chain ürünleri nerede üretiliyor?",
        answer: "Standartlarımızı en üstte tutmak adına tüm premium ve ağır (heavyweight) kumaşlarımızı İstanbul ve özel yurt dışı atölyelerinde kendi denetimimiz altında üretiyoruz."
    },
    {
        question: "Beden seçimini nasıl yapmalıyım?",
        answer: "Tasarım çizgimiz genellikle Oversize (Geniş kalıp) veya relax fit'dir. Ürün sayfasının hemen altındaki 'Beden Tablosu'nu detaylı hazırladık, ölçülerinizi o rehbere göre hesaplayabilirsiniz."
    },
    {
        question: "Koleksiyonlar (Drop) tekrar stoklara girecek mi?",
        answer: "Bazı çekirdek (core) ve özel imzalı ürünlerimiz stokları tükenince nadiren tekrar üretime girer. Limitli sezon ('Drop') koleksiyonları ise genellikle tek atımlıktır, efsane olarak kalırlar."
    },
    {
        question: "Ödeme seçenekleriniz neler, güvenilir mi?",
        answer: "256 Bit SSL güvencesiyle tüm kredi/banka kartları güvenli altyapı üzerinden geçmektedir. İyzico, Stripe gibi bilindik ve devasa ödeme aracılarını kullanıyoruz."
    }
];

export const SIZE_GUIDE_DATA = {
    title: "Beden Tablosu",
    subtitle: "Doğru Zırhı Kuşan.",
    categories: [
        {
            name: "Oversize T-Shirts",
            columns: ["Beden", "Göğüs (cm)", "Uzunluk (cm)", "Omuz (cm)"],
            rows: [
                ["S", "58", "72", "54"],
                ["M", "60", "74", "56"],
                ["L", "62", "76", "58"],
                ["XL", "64", "78", "60"]
            ]
        },
        {
            name: "Bottoms (Cargo & Denim)",
            columns: ["Beden", "Bel (cm)", "Boy (cm)", "Paça Genişliği (cm)"],
            rows: [
                ["28/S", "38", "104", "18"],
                ["30/M", "40", "106", "19"],
                ["32/L", "42", "108", "20"],
                ["34/XL", "44", "110", "21"]
            ]
        }
    ]
};

export const TERMS_POLICY_DATA: PolicyData = {
    title: "Hizmet Şartları",
    subtitle: "Kurallar Net. Oyun Adil.",
    sections: [
        {
            heading: "Genel Koşullar",
            content: [
                "Bu web sitesini kullanarak aşağıdaki şartları kabul etmiş sayılırsınız. Sitemizde sunulan tüm ürünler, içerikler ve hizmetler CHASE & CHAIN markasına aittir.",
                "Kullanıcılar, siteyi yalnızca yasal amaçlarla ve bu şartlara uygun biçimde kullanmakla yükümlüdür."
            ]
        },
        {
            heading: "Fikri Mülkiyet Hakları",
            content: [
                "Sitedeki tüm görseller, tasarımlar, logolar, metinler ve diğer içerikler telif hakkı ile korunmaktadır.",
                "İçeriklerin izinsiz kopyalanması, dağıtılması veya ticari amaçla kullanılması yasaktır."
            ]
        },
        {
            heading: "Sipariş ve Ödeme",
            content: [
                "Sipariş oluşturulduktan sonra stok durumuna göre onay e-postası gönderilir. Stok tükenmesi halinde sipariş iptal edilir ve ödeme iade edilir.",
                "Fiyatlar önceden haber verilmeksizin değiştirilebilir. Sipariş anındaki fiyat geçerlidir."
            ]
        },
        {
            heading: "Sorumluluk Sınırları",
            content: [
                "CHASE & CHAIN, site üzerindeki teknik aksaklıklardan veya üçüncü parti hizmet sağlayıcıların neden olduğu kesintilerden sorumlu tutulamaz.",
                "Ürünlerin kullanımından kaynaklanan hasarlardan dolayı sorumluluk kabul edilmez."
            ]
        }
    ]
};

export const PRIVACY_POLICY_DATA: PolicyData = {
    title: "Gizlilik Politikası",
    subtitle: "Verinin Güvenliği Bizim İçin Kutsal.",
    sections: [
        {
            heading: "Toplanan Veriler",
            content: [
                "Sipariş ve üyelik süreçlerinde ad, soyad, e-posta, telefon, adres gibi kişisel bilgileriniz toplanmaktadır.",
                "Site kullanım alışkanlıklarınız çerezler (cookies) aracılığıyla anonim olarak analiz edilebilir."
            ]
        },
        {
            heading: "Verilerin Kullanımı",
            content: [
                "Kişisel verileriniz yalnızca sipariş işleme, kargo takibi, müşteri desteği ve yasal yükümlülükler kapsamında kullanılır.",
                "Verileriniz üçüncü şahıslarla pazarlama amacıyla paylaşılmaz. Yalnızca kargo şirketi ve ödeme altyapı sağlayıcısı gibi zorunlu iş ortaklarıyla paylaşılır."
            ]
        },
        {
            heading: "Veri Güvenliği",
            content: [
                "Tüm ödeme işlemleri 256-bit SSL sertifikası ile şifrelenmektedir.",
                "Kişisel verileriniz güvenli sunucularda saklanmakta ve yetkisiz erişime karşı korunmaktadır."
            ]
        },
        {
            heading: "Haklarınız",
            content: [
                "KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) kapsamında verilerinize erişim, düzeltme veya silme talebinde bulunabilirsiniz.",
                "Bu haklarınızı kullanmak için support@chaseandchain.com adresine başvurabilirsiniz."
            ]
        }
    ]
};

