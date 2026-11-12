import { db, requireAuth } from './firebase-config.js';
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const initialCatalogData = [
  // Gibson
  { id: "gibson-1", brand: "Gibson", name: "Gibson Les Paul Studio Session", price: 1999, image: "https://vietmusic.vn/cdn/shop/files/LPSTAA01HBCH1_front.jpg?v=1733896075&width=1946", description: "Designed for studio musicians and performers, featuring an ultra-modern weight-relieved mahogany body, maple top, and dual '57 Classic humbuckers for versatile high-gain and crystal-clean tones.", isBestSeller: true },
  { id: "gibson-2", brand: "Gibson", name: "Gibson Les Paul Studio Double Trouble", price: 1599, image: "https://www.bettermusic.com.au/cdn/shop/files/LPSTDCW26HSCH1_1.png?v=1774569756&width=1920", description: "A stripped-back double-cutaway powerhouse built for effortless high-fret access, equipped with dual 490R and 490T humbuckers delivering classic mid-range warmth.", isBestSeller: true },
  { id: "gibson-3", brand: "Gibson", name: "Gibson Custom 1957 Les Paul Junior Reissue", price: 5399, image: "https://guitardien.vn/cdn/shop/files/DanGuitarDi_nGibsonCustom1957LesPaulJuniorSingleCutReissueVOS_TVYellowtannhaccu_4.jpg?v=1791303127&width=1200", description: "Crafted by the Gibson Custom Shop with historical accuracy, featuring a solid mahogany slab body, single Dogear P-90 pickup, and 1950s chunky neck profile.", isBestSeller: true },
  { id: "gibson-4", brand: "Gibson", name: "Gibson Custom Les Paul Axcess Standard", price: 6299, image: "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_45/459749/20922372_800.jpg", description: "Modernized performance classic featuring an apex carved heel for seamless upper-register access, Floyd Rose locking tremolo system, and coil-splitting humbuckers." },
  { id: "gibson-5", brand: "Gibson", name: "Gibson Victory Figured Top", price: 2499, image: "https://tannhaccu.vn/cdn/shop/files/DanGuitarDi_nGibsonVictoryFiguredTop_SmokehouseBursttannhaccu_4.jpg?v=1755226736", description: "A revival of the iconic 1980s offset design, combining a AAA figured maple top, 80s Tribute humbuckers, and push-pull coil tap capabilities." },
  { id: "gibson-6", brand: "Gibson", name: "Gibson SG Standard '61 Faded", price: 1799, image: "https://tannhaccu.vn/cdn/shop/files/DanGuitarDi_nGibsonSGStandard_61FadedMaestroVibrola_VintageCherrytannhaccu_1.jpg?v=1755157007", description: "Features a satin nitrocellulose lacquer finish, slim taper mahogany neck, and Burstbucker 61R/61T pickups for vintage PAF warmth and bite.", isBestSeller: true },
  { id: "gibson-7", brand: "Gibson", name: "Gibson ES-335 60s", price: 3499, image: "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_48/482467/18401207_800.jpg", description: "The cornerstone semi-hollowbody guitar featuring a maple centerblock, rounded C mahogany neck, and hand-wired Calibrated T-Type humbucking pickups.", isNew: true },
  { id: "gibson-8", brand: "Gibson", name: "Gibson Flying V 80s", price: 2499, image: "https://rvb-img.reverb.com/i/s--6aAhqZrl--/quality=medium-low,height=800,width=800,fit=contain/vpqrer0g9aocalwd5nk5.png", description: "Based on the heavy metal staple of 1984, equipped with a mahogany body, slim taper neck, rosewood fretboard, and 80s Tribute uncovered humbuckers." },
  { id: "gibson-9", brand: "Gibson", name: "Gibson Custom LE 1959 ES-330 Reissue", price: 3499, image: "https://vietmusic.vn/cdn/shop/files/ES3000SCNH1_front_1af9b3f3-50a4-4814-bb90-af735a460a99.jpg?v=1746972676&width=1946", description: "Fully hollowbody acoustic-electric design fitted with dual Underwound P-90 pickups, delivering open resonant acoustic tones with rich electric snarl." },
  { id: "gibson-10", brand: "Gibson", name: "Gibson Custom LE 1964 SG Standard", price: 6699, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLQbwcBk2BrEe5KBZYoLYT2D2c7FpkvN7KWQ&s", description: "Recreated using 3D scanning technology, featuring a Maestro Vibrola tailpiece, authentic medium-jumbo frets, and Custombucker Alnico III pickups.", isNew: true },

  // Fender
  { id: "fender-1", brand: "Fender", name: "Fender Player Plus Telecaster", price: 1709, image: "https://vietthuong.vn/image/cache/catalog/fender-player-plus-telecaster-mn-cmj-400x400.jpg", description: "Powered by Player Plus Noiseless Tele pickups for warm twang without hum, featuring a 12\" radius fingerboard with rolled edges and block steel saddles." },
  { id: "fender-2", brand: "Fender", name: "Fender AM Ultra Stratocaster®", price: 1749, image: "https://vietthuong.vn/image/cache/catalog/fender/Electric/fender-am-ultra-strat-maple-hss-ultraburst-0118022712-400x400.jpg", description: "Fender's premier modern series featuring an augmented D neck profile, compound 10\"-14\" radius fretboard, Ultra Noiseless Vintage pickups, and tapered neck heel." },
  { id: "fender-3", brand: "Fender", name: "Fender American Professional II Stratocaster®", price: 2439, image: "https://vietthuong.vn/image/catalog/fender/fender-american-professional-ii-stratocaster-0113902747.jpg", description: "Fitted with V-Mod II Stratocaster single-coil pickups, an upgraded 2-point tremolo with cold-rolled steel block, and a Deep C neck with 'Super-Natural' satin finish." },
  { id: "fender-4", brand: "Fender", name: "Squier Fsr Sonic Stratocaster®", price: 5399, image: "https://vietthuong.vn/image/cache/catalog/squier/squier-fsr-sonic-strat-hss-laurel-surf-green-0373200557-400x400.jpg", description: "Lightweight poplar body paired with an HSS pickup configuration, sealed-gear tuning machines, and a 6-saddle vintage-style synchronized tremolo.", isBestSeller: true },
  { id: "fender-5", brand: "Fender", name: "Fender Hybrid II Stratocaster®", price: 4659, image: "https://vietthuong.vn/image/catalog/2-electric-guitar/fender-hybrid-ii-strat-rw.jpg", description: "Made in Japan combining vintage aesthetic appeal with modern playability, featuring Hybrid II Custom Voiced Single Coil pickups and narrow-tall frets." },
  { id: "fender-6", brand: "Fender", name: "Fender J 75 ann", price: 1289, image: "https://vietthuong.vn/image/cache/catalog/2-electric-guitar/fender-j-75-ann-rw-2cb-400x400.jpg", description: "Special 75th Anniversary edition featuring a headstock-matching logo, vintage-style '60s single-coil pickups, and custom engraved neck plate.", isNew: true },
  { id: "fender-7", brand: "Fender", name: "Fender Player Stratocaster® HSH", price: 1899, image: "https://vietthuong.vn/image/cache/catalog/2-electric-guitar/fender-player-stratocasterr-hsh-400x400.jpg", description: "Versatile HSH pickup array with dual Player Series humbuckers and a center single-coil, paired with a 22-fret 9.5\" radius fingerboard." },
  { id: "fender-8", brand: "Fender", name: "Fender Aerodyne II Stratocaster®", price: 3619, image: "https://vietthuong.vn/image/catalog/2-electric-guitar/fender-aerodyne-ii-strat-hss-rw-hss-medium.jpg", description: "Sleek carved top design with black binding, Dragster BB humbucker in the bridge, and aerodyne single-coils in neck/middle positions.", isNew: true },
  { id: "fender-9", brand: "Fender", name: "Fender Vintera Road Worn® '50s Stratocaster®", price: 2439, image: "https://vietthuong.vn/image/cache/catalog/2-electric-guitar/fender-vintera-road-wornr-50s-stratocasterr-400x400.jpg", description: "Distressed nitrocellulose lacquer finish recreating the look and broken-in feel of a well-loved original 1950s Stratocaster." },
  { id: "fender-10", brand: "Fender", name: "Fender Player Telecaster®", price: 5699, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLQbwcBk2BrEe5KBZYoLYT2D2c7FpkvN7KWQ&s", description: "Classic Tele twang and bite delivered through dual Player Series single-coil pickups, bent-steel saddles, and a Modern C maple neck profile.", isNew: true },

  // Epiphone
  { id: "epiphone-1", brand: "Epiphone", name: "Epiphone Sheraton", price: 899, image: "https://rvb-img.reverb.com/i/s--c5QbMLel--/quality=medium-low,height=800,width=800,fit=contain/izcowpveoske3ysjiuol.png", description: "Semi-hollow design crafted with a layered maple body, maple centerblock, ProBucker Mini Humbuckers, and Frequensator split-trapeze tailpiece." },
  { id: "epiphone-2", brand: "Epiphone", name: "Epiphone USA Coronet", price: 1699, image: "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_58/588968/20935856_800.jpg", description: "Built in the USA featuring a symmetrical mahogany body, single USA P-90 Soapbar pickup, CTS potentiometers, and Grover Mini Rotomatic tuners.", isBestSeller: true },
  { id: "epiphone-3", brand: "Epiphone", name: "Epiphone Emperor Swingster", price: 799, image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTisMXjSd9GKQHYg4JWD5hhxc1KLihmnmwQKw&s", description: "Hollowbody rockabilly and jazz machine featuring Epiphone SwingBucker pickups with series/parallel switching and a licensed Bigsby vibrato." },
  { id: "epiphone-4", brand: "Epiphone", name: "Epiphone USA Casino", price: 3499, image: "https://cdn11.bigcommerce.com/s-dks6ju/images/stencil/1280x1280/products/25224/321416/bbda67c2-587a-5f27-a6b1-329fe9840686__51039.1715804988.jpg?c=2", description: "Made in the USA hollowbody legend fitted with Gibson USA Dogear P-90 pickups, 3-ply maple/poplar/maple body, and hand-wired Orange Drop capacitors.", isBestSeller: true },
  { id: "epiphone-5", brand: "Epiphone", name: "Epiphone Les Paul Custom", price: 799, image: "https://vietmusic.vn/cdn/shop/files/EIGLPCEBGH1_front__1_1ceef816-9370-4afa-a502-6ec89a374e75.jpg?v=1741442874&width=1946", description: "Part of the Inspired by Gibson collection, featuring multi-ply custom binding, ebony fingerboard, gold hardware, and ProBucker humbuckers." },
  { id: "epiphone-6", brand: "Epiphone", name: "Epiphone IGC 1960 Les Paul Special Double Cut Reissue", price: 999, image: "https://www.russomusic.com/cdn/shop/files/ECLSR0PENH1-epiphone-1960-les-paul-special-double-cut-reissue-electric-pelham-blue-3_500x.png?v=1764007236", description: "Inspired by Custom Shop models, offering a solid mahogany body, CTS electronics, Mallory capacitors, and Gibson USA Soapbar P-90 pickups." },
  { id: "epiphone-7", brand: "Epiphone", name: "Epiphone Les Paul Standard 50s", price: 899, image: "https://vietmusic.vn/cdn/shop/files/static.gibson.com_product-images_Epiphone_EPI8IH60_Heritage_Cherry_Sunburst_EILS5HSNH1_front.jpg?v=1764522595&width=1946", description: "Recreates the feel of vintage 1950s Les Pauls with a mahogany body, maple cap, 50s neck profile, and ProBucker-2 and ProBucker-3 humbuckers.", isBestSeller: true },
  { id: "epiphone-8", brand: "Epiphone", name: "Epiphone SG Standard", price: 599, image: "https://vietmusic.vn/cdn/shop/files/EIGSGSEBNH1_front.jpg?v=1741101562&width=1946", description: "Classic double-cutaway design featuring an all-mahogany body, SlimTaper neck profile, and Alnico Classic PRO humbuckers." },
  { id: "epiphone-9", brand: "Epiphone", name: "Epiphone Matt Heafy Les Paul Custom Origins", price: 1199, image: "https://rvb-img.reverb.com/i/s--IU8ky_yb--/quality=medium-low,height=800,width=800,fit=contain/ye11kelass1d12hjfwcw.jpg", description: "Signature model for Trivium's Matt Heafy, equipped with custom Fishman Fluence active pickups offering three distinct tonal voicings.", isNew: true },
  { id: "epiphone-10", brand: "Epiphone", name: "Epiphone Firebird", price: 799, image: "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_63/633990/20837917_800.jpg", description: "Reverse body and headstock design constructed with 9-ply mahogany/walnut neck-through architecture and ProBucker FB720 mini-humbuckers.", isNew: true },

  // Kramer
  { id: "kramer-1", brand: "Kramer", name: "Kramer Pacer Deluxe 87 EMG", price: 1499, image: "https://media.guitarcenter.com/is/image/MMGS7/M13649000001000-02-600x600.jpg", description: "Tribute to Kramer's shredding legacy with active EMG 81/85 humbuckers, Floyd Rose 1000 Series double-locking tremolo, and maple neck.", isNew: true },
  { id: "kramer-2", brand: "Kramer", name: "Kramer Jersey Star", price: 1299, image: "https://d13s5rafcqkqiu.cloudfront.net/CACHE/images/products/other/kramer/906116_kramer-jersey-star-electric-guitar_gQkRkT_1-auto/e6086161fa97c5acf9a8f31fee27f45c.jpg", description: "Iconic 1980s signature design featuring gold hardware, mother-of-pearl star fretboard inlays, and three Seymour Duncan JB Jr. and JN humbuckers.", isNew: true },
  { id: "kramer-3", brand: "Kramer", name: "Kramer Volante HSGT", price: 999, image: "https://imgs.ssl-jan-pic.com/files/ec3bb57ef0c5d56992881219ca912f11c299dc8e72c714abd1e2f9ccc6b54e70.jpg", description: "High-speed shred guitar featuring an asymmetric double-cutaway mahogany body, high-output Alnico humbuckers, and recessed Floyd Rose bridge.", isBestSeller: true },
  { id: "kramer-4", brand: "Kramer", name: "Kramer Assault Figured", price: 999, image: "https://d13s5rafcqkqiu.cloudfront.net/CACHE/images/products/other/kramer/848566_kramer-assault-figured-electric-guitar_WAbokt_2-auto/23a97b3f93c41e065e1495af255f6f9f.jpg", description: "Single-cutaway body with carved figured maple top, set neck construction, 24 fret ebony fingerboard, and Kramer Alnico V humbuckers." },
  { id: "kramer-5", brand: "Kramer", name: "Kramer 84 HH", price: 999, image: "https://rvb-img.reverb.com/i/s--gKRlGjzY--/quality=medium-low,height=800,width=800,fit=contain/xoona8mmxdaxt4r2p96s.png", description: "Homage to Kramer's golden era with an alder body, Seymour Duncan JB humbucker in the bridge, JN in the neck, and push-pull series/parallel switching.", isNew: true },
  { id: "kramer-6", brand: "Kramer", name: "Kramer Nite-V", price: 899, image: "https://rvb-img.reverb.com/i/s--WN9tVzPL--/quality=medium-low,height=800,width=800,fit=contain/i0ns6pn1czad0yokotl3.jpg", description: "Aggressive V-shape guitar equipped with Thornbucker-inspired high-gain pickups, string-through-body hardtail bridge, and thorn inlays." },
  { id: "kramer-7", brand: "Kramer", name: "Kramer Baretta Special", price: 229, image: "https://cdn.sanity.io/images/5skqgt41/production/7b6444f25d047bf1ed8476f4ea32490765e4136b-1000x1000.jpg?auto=format", description: "Accessible entry into Kramer performance featuring a single high-output Alnico V zebra humbucker, vintage-style tremolo, and slim maple neck.", isBestSeller: true },
  { id: "kramer-8", brand: "Kramer", name: "Kramer SM-1", price: 1049, image: "https://images.musicstore.de/images/1280/kramer-guitars-sm-1-candy-blue_1_GIT0053861-000.jpg", description: "Neck-through mahogany body design equipped with a Seymour Duncan JB bridge pickup and dual Cool Rails in the middle/neck positions." },
  { id: "kramer-9", brand: "Kramer", name: "Kramer Striker Figured HSS", price: 379, image: "https://cdn11.bigcommerce.com/s-dks6ju/images/stencil/1280w/products/30774/537963/kramer-striker-figured-hss-stoptail-transparent-ebony__28086.1710587392.jpg?c=2", description: "Features a AAA flame maple veneer top, versatile HSS pickup layout, fast-playing satin-finished maple neck, and licensed Floyd Rose tremolo.", isNew: true },
  { id: "kramer-10", brand: "Kramer", name: "Kramer Charlie Parra Vanguard", price: 899, image: "https://rvb-img.reverb.com/i/s--yapYrgmD--/quality=medium-low,height=800,width=800,fit=contain/qwdarflmalg9xi3msl7r.jpg", description: "Signature model for metal guitarist Charlie Parra, featuring EMG 57/66 active pickups and a custom gold hardware signature motif." },

  // PRS
  { id: "prs-1", brand: "PRS", name: "PRS Custom 24 Piezo", price: 1599, image: "https://vietmusic.vn/cdn/shop/files/Cobalt_Smokeburst1.webp?v=1761627657&width=1946", description: "Dual-output guitar featuring PRS 85/15 humbuckers paired with an acoustic LR Baggs piezo system for blending acoustic and electric tones.", isBestSeller: true },
  { id: "prs-2", brand: "PRS", name: "PRS CE 24 Semi-Hollow", price: 1799, image: "https://mainguyenmusic.vn/cdn/shop/files/dan-guitar-dien-prs-ce-24-semi-hollow-wbag-dark-cherry-sunburst-mai-nguyen-music.jpg?v=1691172645", description: "Combines the snap and response of a bolt-on maple neck with the added resonance and air of a semi-hollow mahogany/maple body.", isBestSeller: true },
  { id: "prs-3", brand: "PRS", name: "PRS McCarty 594 Mango Top", price: 3499, image: "https://images.musicstore.de/images/1280/prs-mccarty-594-mango-top-limited-edition-black-gold-burst_1_GIT0065014-000.jpg", description: "Limited Edition model featuring a rare figured Mango wood top, 58/15 LT pickups, 24.594\" scale length, and two-piece zinc bridge." },
  { id: "prs-4", brand: "PRS", name: "PRS SE Mark Holcomb SVN", price: 8599, image: "https://www.sweelee.com.vn/cdn/shop/products/products_2FP13-111858-HL-MH77QHL_2FP13-111858-HL-MH77QHL_1676705178330.jpg?v=1677497233&width=2048", description: "7-string progressive metal machine featuring Seymour Duncan Alpha and Omega humbuckers, a 20\" fretboard radius, and 26.5\" scale length." },
  { id: "prs-5", brand: "PRS", name: "PRS Private Stock Hollowbody I", price: 4599, image: "https://guitardien.vn/cdn/shop/files/PRSMcCarty594HollowbodyII-TanNhacCu_9_fa3d827f-c74e-411a-ad7f-b5369319c5d0.png?v=1744690384", description: "Masterbuilt fully hollow instrument featuring hand-selected curly maple top, mahogany back, and Private Stock 58/15 humbucking electronics.", isNew: true },
  { id: "prs-6", brand: "PRS", name: "PRS Silver Sky Wild Blue", price: 3999, image: "https://vietmusic.vn/cdn/shop/files/PRS_JMSS_JY_Front_912395-fdda89f323024a10517c7d3e11c73164.jpg?v=1777666393&width=1946", description: "John Mayer signature model featuring 635JM single-coil pickups, a 7.25\" radius rosewood fingerboard, and vintage style locking tuners." },
  { id: "prs-7", brand: "PRS", name: "PRS Fiore HH", price: 3899, image: "https://thumbs.static-thomann.de/thumb/padthumb600x600/pics/bdb/_63/631606/20842782_800.jpg", description: "Mark Lettieri signature model engineered for maximum dynamic range, featuring a 25.5\" scale length, swamp ash body, and custom Fiore humbuckers." },
  { id: "prs-8", brand: "PRS", name: "PRS S2 Studio", price: 1789, image: "https://vietmusic.vn/cdn/shop/files/PRS-Paul-Reed-Smith-S2-Studio-Electric-Guitar-Faded-Grey-Black-Blue-Burst_5000x_998bbe35-7598-45c1-8c5e-ce4da5acbf79.webp?v=1753706866&width=1946", description: "Features a Type-D single-coil setup in the neck and middle with a Starla humbucker in the bridge, offering 7 distinct pickup combinations.", isNew: true },
  { id: "prs-9", brand: "PRS", name: "PRS S2 Standard 24", price: 5269, image: "https://vietmusic.vn/cdn/shop/files/1_Full_Straight_Front_NA-114fd86e5b868e52226d6be1954de076.jpg?v=1753766979&width=1946", description: "All-mahogany solid body construction equipped with 85/15 \"S\" pickups, push/pull tone coil tapping, and a patented PRS molded tremolo.", isNew: true },
  { id: "prs-10", brand: "PRS", name: "PRS SE Hollowbody Standard Piezo", price: 699, image: "https://vietmusic.vn/cdn/shop/files/products_2FP13-111515-DH-HBPEIBDH_2FP13-111515-DH-HBPEIBDH_1680144600580_9d814ef4-14c9-4357-a2f0-d5b3016ec13a.webp?v=1752751257&width=1946", description: "All-mahogany hollowbody with dual 58/15 \"S\" humbuckers and LR Baggs/PRS Piezo system for dual acoustic and electric output.", isNew: true }
];

let masterCatalog = [];

// Protect page: force login before loading catalog
requireAuth(async () => {
  await loadGuitarsFromFirestore();
  setupFeaturedSections();
  setupBrandSections();
});

async function loadGuitarsFromFirestore() {
  try {
    const guitarsRef = collection(db, "guitars");
    let snapshot = await getDocs(guitarsRef);

    // Auto-seed Firestore if the "guitars" collection is empty on first run
    if (snapshot.empty) {
      console.log("Seeding initial guitars into Firestore...");
      for (const guitar of initialCatalogData) {
        await setDoc(doc(db, "guitars", guitar.id), guitar);
      }
      snapshot = await getDocs(guitarsRef);
    }

    masterCatalog = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
  } catch (error) {
    console.error("Firestore catalog fetch failed:", error);
    alert("Failed to load guitars from database. Check your Firebase permissions.");
  }
}

window.selectProduct = function (guitarId) {
  const foundProduct = masterCatalog.find(item => item.id === guitarId);
  if (!foundProduct) return;

  localStorage.setItem('selectedProductId', foundProduct.id);
  window.location.href = `product.html?id=${encodeURIComponent(foundProduct.id)}`;
};

function setupBrandSections() {
  const brands = ['Gibson', 'Fender', 'Epiphone', 'Kramer', 'PRS'];
  brands.forEach(brandName => {
    const section = document.getElementById(brandName);
    if (!section) return;

    const grid = section.querySelector('.product-grid');
    if (!grid) return;

    const brandProducts = masterCatalog.filter(p => p.brand === brandName);
    section.style.display = 'block';
    grid.innerHTML = brandProducts.map(prod => `
      <div class="product-card" onclick="selectProduct('${prod.id}')">
        <img src="${prod.image}" alt="${prod.name}">
        <h3 title="${prod.name}">${prod.name}</h3>
        <p>$${Number(prod.price).toLocaleString()}</p>
      </div>
    `).join('');
  });
}

function setupFeaturedSections() {
  const createFeaturedCardHTML = (product, badgeText, badgeClass) => `
    <div class="featured-card" onclick="selectProduct('${product.id}')">
      <span class="badge ${badgeClass}">${badgeText}</span>
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p class="price">$${Number(product.price).toLocaleString()}</p>
    </div>
  `;

  const newArrivalsGrid = document.getElementById('new-arrivals-grid');
  if (newArrivalsGrid) {
    let newItems = masterCatalog.filter(item => item.isNew);
    if (newItems.length === 0) newItems = masterCatalog.slice(0, 4);
    newArrivalsGrid.innerHTML = newItems.slice(0, 4)
      .map(item => createFeaturedCardHTML(item, 'NEW', 'badge-new'))
      .join('');
  }

  const bestSellersGrid = document.getElementById('best-sellers-grid');
  if (bestSellersGrid) {
    let hotItems = masterCatalog.filter(item => item.isBestSeller);
    if (hotItems.length === 0) hotItems = masterCatalog.slice(4, 8);
    bestSellersGrid.innerHTML = hotItems.slice(0, 4)
      .map(item => createFeaturedCardHTML(item, 'HOT', 'badge-hot'))
      .join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchModal = document.getElementById('search-modal');
  const closeSearchBtn = document.getElementById('close-search-btn');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  if (searchToggleBtn && searchModal) {
    searchToggleBtn.addEventListener('click', () => {
      searchModal.classList.remove('hidden');
      if (searchInput) searchInput.focus();
    });
  }

  if (closeSearchBtn && searchModal) {
    closeSearchBtn.addEventListener('click', () => {
      searchModal.classList.add('hidden');
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.toLowerCase().trim();

      if (searchModal) searchModal.classList.add('hidden');

      const featuredSection = document.querySelector('.featured-section');
      if (!query) {
        if (featuredSection) featuredSection.style.display = 'flex';
        setupBrandSections();
        return;
      }

      if (featuredSection) featuredSection.style.display = 'none';

      const brands = ['Gibson', 'Fender', 'Epiphone', 'Kramer', 'PRS'];
      brands.forEach(brandName => {
        const section = document.getElementById(brandName);
        if (!section) return;

        const grid = section.querySelector('.product-grid');
        if (!grid) return;

        const matches = masterCatalog.filter(item =>
          item.brand === brandName &&
          (item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query))
        );

        if (matches.length > 0) {
          section.style.display = 'block';
          grid.innerHTML = matches.map(prod => `
            <div class="product-card" onclick="selectProduct('${prod.id}')">
              <img src="${prod.image}" alt="${prod.name}">
              <h3 title="${prod.name}">${prod.name}</h3>
              <p>$${Number(prod.price).toLocaleString()}</p>
            </div>
          `).join('');
        } else {
          section.style.display = 'none';
        }
      });
    });
  }

  // Chat Widget Toggle
  const openChatBtn = document.getElementById('open-chat-btn');
  const closeChatBtn = document.getElementById('close-chat-btn');
  const chatWidget = document.getElementById('chat-widget-container');

  if (openChatBtn && chatWidget) {
    openChatBtn.addEventListener('click', () => {
      chatWidget.classList.toggle('hidden');
    });
  }

  if (closeChatBtn && chatWidget) {
    closeChatBtn.addEventListener('click', () => {
      chatWidget.classList.add('hidden');
    });
  }
});