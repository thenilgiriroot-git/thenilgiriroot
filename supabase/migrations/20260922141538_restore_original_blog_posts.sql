-- Restores the 2 blog categories and 9 blog posts exported from the
-- original Lovable-connected Supabase project, after the switch to this
-- project left the blog table empty. Featured images already ship from
-- public/blog/ in this repo, so featured_image stores local site paths
-- rather than remote storage URLs. Idempotent: safe to re-run.

insert into public.blog_categories (id, name, slug, description, created_at) values
  ('2a1e02bc-e3b5-4ec9-8525-746d7d10b123', 'Process', 'process', 'How we make our value added farm products', '2026-04-23T16:03:25.74192+00:00'),
  ('dbf5301f-d33d-4fa2-9cb0-ccab3f078093', 'Recipes', 'recipes', 'Recipes built around frozen french fries', '2026-04-23T16:03:25.74192+00:00')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.blog_posts (
  id, category_id, title, slug, excerpt, content, featured_image,
  meta_title, meta_description, meta_keywords, status,
  reading_time_minutes, published_at, created_at, updated_at
) values

('ddef4d54-a912-4b3b-b190-d8f631266cef', '2a1e02bc-e3b5-4ec9-8525-746d7d10b123',
 'How Blast Freezing Helps Maintain Quality in Frozen Fries',
 'blast-freezing-quality-frozen-fries',
 'Why blast freezing is the quiet hero behind a clean, just-made bite — and how it protects texture, colour and flavour in every bag.',
$content$## A clean, just-made bite — even from the freezer

The difference between a forgettable fry and a great one often comes down to one thing: **how it was frozen**. At The Nilgiri Root, our fries pass through a blast freezer that rapidly drops the product to sub-zero temperatures, locking in the qualities our chefs and partners care about most.

## What blast freezing actually does

When fries are cooled slowly, large ice crystals form inside the potato. Those crystals rupture cell walls, leaving the fry soggy when it hits the oil.

A **blast freezer** uses high-velocity, sub-zero air to chill each piece quickly and evenly. Smaller ice crystals form. Cell structure stays intact. Texture, colour, and flavour stay close to the moment the fry left the line.

## What this means for our partners

- **Crisper finish** — fries hold their crunch longer on the plate.
- **Cleaner colour** — no dull, grey edges from slow freezing.
- **Consistent batches** — every bag behaves the same in the kitchen.
- **Less oil absorption** — a lighter, more honest bite.

## Built into our process

Blast freezing is the last technical step before packaging. It is paired with disciplined sourcing, controlled blanching, and careful par-frying — so the freezer isn't fixing problems, it's preserving quality that's already there.

For distributors, retailers and HoReCa partners, this is what consistency looks like in a bag: a fry that cooks the way it's supposed to, every time.$content$,
 '/blog/blast-freezing.jpg',
 'How Blast Freezing Protects Frozen Fry Quality',
 'How blast freezing locks in texture, colour and flavour for premium frozen french fries.',
 'blast freezing, frozen fries quality, blast freezer process, frozen french fries India',
 'published', 5, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('4d6ebb38-c9a2-44c7-95e7-2fcbcb76faf5', '2a1e02bc-e3b5-4ec9-8525-746d7d10b123',
 'Sourcing Frozen French Fries for HORECA and QSR Chains in India: What Operations Heads Should Demand',
 'sourcing-frozen-french-fries-horeca-qsr-india',
 'Operations playbook for hotel groups, QSR chains, and cloud kitchens sourcing frozen french fries in India — covering supply consistency, cold chain, and contract terms.',
$content$If you run procurement for a hotel group, a QSR chain, or a multi-brand cloud kitchen, frozen french fries are probably one of your top-five SKUs by volume. Yet most operations heads inherit a supplier rather than choosing one. This is the playbook to fix that.

## Step 1: Define your fry brief in writing

Before you talk to any manufacturer, your team should agree on:

- **Cut size** (9mm, 10mm, 11mm — see our [cut size guide](/blog/9mm-vs-10mm-vs-11mm-frozen-french-fries-cut-size-guide))
- **Pack size** (1kg, 2.5kg, bulk)
- **Monthly volume** (kg/month per outlet × number of outlets)
- **Replenishment cadence** (weekly, fortnightly)
- **Cold chain endpoints** (CDC, individual outlets, or both)

Send this brief to every supplier you evaluate. It eliminates the back-and-forth and forces clean quotes.

## Step 2: Insist on supply consistency, not just price

A ₹5/kg discount means nothing if your supplier short-ships during the monsoon. Ask:

- What is your peak-season fill rate? (Target: >97%)
- How many days of finished-goods inventory do you hold?
- What is your contingency if your primary cold storage goes down?

For HORECA-grade reliability, see our [HORECA supplier program](/frozen-french-fries-horeca-supplier). For high-volume QSR chains, the [QSR supplier](/frozen-french-fries-qsr-supplier) program is built around batch-coded traceability and weekly replenishment.

## Step 3: Audit the cold chain end-to-end

Frozen fries are only as good as the warmest point in their journey. Before signing, ask the supplier to walk you through:

- Plant blast freezer → core temp and dwell time
- Plant cold storage → -18°C verified, dual-redundant
- Outbound truck → reefer temperature logs available on demand
- Distributor / CDC handover → temperature checked and recorded

If the supplier can't show you logs, assume they don't exist.

## Step 4: Lock the contract terms that actually matter

Most fry contracts focus on price and MOQ. The terms that protect operations are:

- **Fill rate SLA** (with rebate for misses)
- **Lead time guarantee** (e.g., 7 days from PO)
- **Quality clause** (return/credit on out-of-spec batches)
- **Price-lock window** (90 or 180 days)
- **Single point of contact** (named account manager, not a generic email)

## Step 5: Run a 60-day pilot before national rollout

Pick 3–5 outlets across geographies. Run for 60 days. Track:
- Customer complaints per 1000 servings
- Yield per kg (fries served vs. fries ordered)
- Stock-outs and short-ships

Only then commit to network-wide rollout.

## Step 6: Build redundancy

Even your best supplier will have a bad month. For volumes above 5 tonnes/month, **always run two qualified suppliers** at a 70/30 split. This keeps your primary honest and your kitchens running.

## Bonus: distributor or direct?

Direct from the manufacturer works best when:
- You're ordering >2 tonnes/month per drop point
- You have your own CDC

Through a distributor works best when:
- You're sub-tonne per drop point
- You need rapid replenishment to many small outlets

Our [distributor and wholesale](/frozen-french-fries-distributor-wholesale) network covers most Indian metros with 48–72 hour replenishment.

## Talk to us

The Nilgiri Root supplies HORECA and QSR chains across India with FSSAI-licensed, blast-frozen french fries from 100% Nilgiri mountain potatoes. We run named account managers, batch traceability, and SLA-backed contracts.

[Request a HORECA / QSR proposal →](/frozen-french-fries-horeca-supplier)$content$,
 '/blog/horeca-qsr-sourcing.jpg',
 'Sourcing Frozen French Fries for HORECA & QSR Chains in India',
 'Operations playbook for HORECA and QSR procurement heads sourcing frozen french fries in India. Cold chain, SLAs, contract terms, and pilot rollout.',
 'horeca frozen french fries supplier, qsr frozen fries india, b2b frozen fries procurement, hotel chain fries supplier',
 'published', 7, '2026-04-28T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00'),

('59040e5b-136f-45a7-8006-83344505961d', 'dbf5301f-d33d-4fa2-9cb0-ccab3f078093',
 'Masala Loaded Fries Recipe',
 'masala-loaded-fries-recipe',
 'A bold, spice-forward loaded fries recipe built on crisp blast frozen 10mm cuts — perfect for cafes and weekend cooking.',
$content$## A loaded fry with real Indian character

This is comfort food with attitude — crisp 10mm fries layered with warm masala, fresh onion, coriander and a generous chutney drizzle. Built for cafes, but easy enough for a Sunday at home.

### Ingredients (serves 2)

- 400g The Nilgiri Root **Classic Cut 10mm** fries
- 1 small onion, finely chopped
- 1 small tomato, finely chopped
- 2 tbsp green chutney
- 2 tbsp tamarind chutney
- 1 tsp chaat masala
- 1/2 tsp red chilli powder
- 1/4 tsp roasted cumin powder
- A handful of fresh coriander
- 2 tbsp sev (optional)
- A squeeze of lime

### Method

1. Cook the fries straight from the freezer per pack instructions until deep golden.
2. Tip onto a warm plate and immediately dust with chaat masala, chilli powder and cumin.
3. Scatter onion and tomato across the top.
4. Drizzle with green and tamarind chutneys.
5. Finish with coriander, sev and a squeeze of lime.

### Serving suggestion

Serve in a paper-lined cast iron skillet with extra chutneys on the side. Eat immediately — the contrast of hot, cold, crisp and soft is the whole point.$content$,
 '/blog/masala-loaded-fries.jpg',
 'Masala Loaded Fries Recipe — The Nilgiri Root',
 'Crisp 10mm fries loaded with masala, chutneys and fresh coriander. A bold Indian-style loaded fries recipe.',
 'masala fries recipe, loaded fries India, indian fries recipe, frozen fries recipe',
 'published', 4, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('ac5c7bb5-e993-4066-8327-8caa4f2fc3e2', 'dbf5301f-d33d-4fa2-9cb0-ccab3f078093',
 'Peri Peri Crispy Fries Recipe',
 'peri-peri-crispy-fries-recipe',
 'Smoky, tangy peri peri fries using crisp blast frozen 9mm cuts — a five-minute snack that punches well above its weight.',
$content$## Peri peri, the right way

The trick to great peri peri fries isn't a heavy sauce — it's a dry seasoning that grips a properly crisp fry. Our 9mm cut, straight from the blast freezer, is built for exactly this.

### Ingredients (serves 2)

- 400g The Nilgiri Root **Classic Cut 9mm** fries
- 1.5 tsp peri peri seasoning
- 1/2 tsp smoked paprika
- 1/4 tsp garlic powder
- A pinch of salt (taste your seasoning first)
- 1 tsp finely chopped parsley (optional)
- Lime wedges, to serve

### Method

1. Cook the fries from frozen until they're a deep, even golden colour.
2. While hot, tip them into a large bowl.
3. Combine peri peri, paprika, garlic powder and salt; sprinkle over the fries.
4. Toss gently — you want every fry coated, not bruised.
5. Finish with parsley and serve with lime wedges and your favourite dip.

### Serving suggestion

Pair with a cool yogurt and mint dip to balance the heat. Great alongside grilled chicken or as a standalone snack with a cold drink.$content$,
 '/blog/peri-peri-fries.jpg',
 'Peri Peri Crispy Fries Recipe — The Nilgiri Root',
 'Smoky, tangy peri peri fries using premium blast frozen 9mm fries. Quick recipe, big flavour.',
 'peri peri fries recipe, spicy fries, frozen fries recipe, crispy fries seasoning',
 'published', 3, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('5c313b87-21a6-4925-91ec-264e31aaa9a9', 'dbf5301f-d33d-4fa2-9cb0-ccab3f078093',
 'Cheesy Baked Fries Recipe',
 'cheesy-baked-fries-recipe',
 'Oven-baked 11mm steakhouse fries blanketed in melted cheese — comfort food, made cleanly.',
$content$## A cleaner take on cheesy fries

Baked, not deep-fried — and built on a thick 11mm cut that holds its shape under cheese without going soft. A great share plate for cafes, pubs, and home dinners.

### Ingredients (serves 3–4)

- 600g The Nilgiri Root **Classic Cut 11mm** fries
- 150g mozzarella, grated
- 50g cheddar, grated
- 2 tbsp olive oil
- 1 tsp Italian herbs
- 1/2 tsp black pepper
- 1/4 tsp paprika
- 2 tbsp chopped chives or spring onion

### Method

1. Pre-heat the oven to 220°C (200°C fan).
2. Spread the fries in a single layer on a lined tray. Drizzle with olive oil and dust with herbs, pepper and paprika.
3. Bake for 18–22 minutes, turning once, until crisp and golden.
4. Push the fries together, scatter mozzarella and cheddar over the top.
5. Return to the oven for 3–4 minutes, until the cheese is fully melted and just blistered.
6. Finish with chives and serve straight from the tray.

### Serving suggestion

Serve with a side of marinara or chipotle mayo. For a heartier plate, top with cooked bacon or jalapeños before the cheese goes in.$content$,
 '/blog/cheesy-baked-fries.jpg',
 'Cheesy Baked Fries Recipe — The Nilgiri Root',
 'Oven-baked 11mm fries topped with melted cheese. A clean, easy comfort food recipe.',
 'cheesy fries recipe, baked fries, loaded fries, frozen fries oven recipe',
 'published', 4, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('8a78619b-c731-4c0f-8859-c5bdaaaf427d', 'dbf5301f-d33d-4fa2-9cb0-ccab3f078093',
 'Restaurant-Style Chilli Garlic Fries',
 'restaurant-style-chilli-garlic-fries',
 'Wok-tossed chilli garlic fries that taste like they came off a restaurant pass — built on crisp blast frozen 10mm cuts.',
$content$## The Indo-Chinese classic, at home

Chilli garlic fries are a staple on every Indo-Chinese menu — and they rely on one thing: a fry crisp enough to survive the wok. Our 10mm cut, blast frozen and straight from the bag, is exactly that.

### Ingredients (serves 2)

- 400g The Nilgiri Root **Classic Cut 10mm** fries
- 1 tbsp neutral oil
- 6 cloves garlic, finely chopped
- 2 dried red chillies, broken
- 1 tsp red chilli paste (or schezwan sauce)
- 1 tbsp soy sauce
- 1 tsp vinegar
- 1/2 tsp sugar
- 2 spring onions, sliced (whites and greens kept separate)
- 1 tsp toasted sesame seeds

### Method

1. Cook the fries from frozen until very crisp. Set aside on a warm plate.
2. Heat oil in a wok or wide pan. Add garlic and dried chillies; cook 30 seconds until fragrant.
3. Add spring onion whites, then chilli paste, soy, vinegar and sugar. Cook 30 seconds.
4. Add the hot fries and toss quickly so every fry is coated — do not stir for too long.
5. Finish with spring onion greens and sesame seeds. Serve immediately.

### Serving suggestion

Plate in a deep bowl and pair with garlic mayo or a side of fried rice. Best eaten the moment it leaves the wok.$content$,
 '/blog/chilli-garlic-fries.jpg',
 'Restaurant-Style Chilli Garlic Fries — The Nilgiri Root',
 'Wok-tossed chilli garlic fries built on crisp blast frozen 10mm cuts. Indo-Chinese classic at home.',
 'chilli garlic fries, indo chinese fries, restaurant fries recipe, frozen fries wok',
 'published', 4, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('6fc5c7a6-76dc-49ac-939d-e929f5945c04', 'dbf5301f-d33d-4fa2-9cb0-ccab3f078093',
 'Indian Snack Platter Ideas Using Frozen Fries',
 'indian-snack-platter-frozen-fries',
 'Three quick snack platter ideas built around blast frozen french fries — perfect for cafes, parties and weekend get-togethers.',
$content$## A platter that does the heavy lifting

Fries are the easiest centrepiece of an Indian snack platter — fast, crowd-friendly, and forgiving. Here are three platter ideas you can build in under 30 minutes using The Nilgiri Root frozen fries.

### 1. The Chaat Platter

- Crisp 9mm fries dusted with chaat masala
- Mini paneer tikka skewers
- Yogurt dip with mint and roasted cumin
- Tamarind and green chutneys on the side

Why it works: the fries replace the usual papdi base — quicker, crisper, and easier to plate.

### 2. The HoReCa Sharing Board

- 10mm fries, salted simply
- Peri peri seasoned 9mm fries
- Cheesy baked 11mm fries
- Three dips: garlic mayo, schezwan, smoky tomato

Why it works: it shows off all three cuts and lets guests build their own bites.

### 3. The Late-Night Cafe Plate

- Chilli garlic 10mm fries
- Crispy fried chicken or paneer 65
- Pickled onions
- A wedge of lime

Why it works: it's fast on the kitchen, low on plating effort, and high on perceived value.

## A note for cafes and distributors

Because our fries are blast frozen, every batch behaves the same — which means a platter built today and a platter built next month will look and taste the same. That consistency is what turns a one-time order into a repeat order.$content$,
 '/blog/snack-platter.jpg',
 'Indian Snack Platter Ideas Using Frozen Fries',
 'Three Indian snack platter ideas built around premium blast frozen french fries — for cafes and home cooks.',
 'snack platter, indian platter, fries platter, party fries, horeca platter ideas',
 'published', 5, '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00', '2026-04-23T16:03:25.74192+00:00'),

('289b33ff-5685-401d-b61e-42337df263e6', '2a1e02bc-e3b5-4ec9-8525-746d7d10b123',
 'How to Choose a Frozen French Fries Manufacturer in India: A B2B Buyer''s Guide',
 'choose-frozen-french-fries-manufacturer-india',
 'A practical 2026 guide for distributors, HORECA buyers, and exporters on evaluating frozen french fries manufacturers in India — covering FSSAI compliance, blast freezing, cut sizes, and supply consistency.',
$content$Choosing the right **frozen french fries manufacturer in India** can make or break your foodservice margin. Whether you're a hotel chain in Mumbai, a QSR brand scaling across Tier-2 cities, or an exporter shipping to the Gulf, the supplier you pick decides your fry quality, your kitchen consistency, and your customer's last bite.

This guide walks you through the criteria a serious B2B buyer should use in 2026.

## 1. Start with the potato, not the package

Most frozen fry quality issues trace back to the raw potato. Look for manufacturers that source from **high-altitude growing regions** — the Nilgiris, parts of Himachal, and the Ooty plateau produce potatoes with the right starch-to-sugar ratio for golden, non-greasy fries.

Ask three questions:
- Where are your potatoes grown?
- Do you contract directly with farmers or buy from mandis?
- What's your harvest-to-freeze window?

A manufacturer that can answer all three with specifics is worth a sample order. If you're sourcing from South India, our [frozen french fries manufacturer in Ooty](/frozen-french-fries-manufacturer-in-ooty) page details how altitude and direct farm contracts shape end-product quality.

## 2. FSSAI is the floor, not the ceiling

Every legitimate Indian manufacturer must hold a valid **FSSAI license** for frozen processed foods. That's table stakes. What separates serious players is what sits on top of it:

- HACCP-aligned process flow
- Documented metal detection at packing
- Cold chain SOPs from plant to truck
- Traceability per batch (lot codes printed on every carton)

Ask for a copy of the FSSAI license and the most recent third-party audit. If they hesitate, walk away.

## 3. Understand the cut sizes you actually need

Cut size determines bite, cook time, and oil pickup. The three workhorse cuts in India are:

- **9mm (shoestring)** — fast cook, crisp finish. Ideal for QSR and delivery. See our [9mm frozen french fries](/frozen-french-fries-9mm) spec sheet.
- **10mm (standard)** — the universal HORECA cut. Good crisp-to-fluffy ratio.
- **11mm (steak cut)** — premium plating, longer cook, stays hot longer on a buffet.

A capable manufacturer should offer all three from the same line, with consistent length and minimal slivers.

## 4. Blast freezing vs. tunnel freezing

This is the single biggest quality differentiator most buyers miss. **Blast freezing** locks in the par-fry crust within minutes, preserving texture. Slow freezing forms larger ice crystals that rupture cells and produce soggy, dark fries on reheat.

Ask: *"What's your core temperature target and how fast do you hit it?"* The right answer is around -18°C core in under 30 minutes from par-fry exit.

## 5. Packaging and pack sizes for your channel

Your channel decides your pack:
- **Retail / D2C:** 500g and 1kg consumer packs
- **HORECA / cloud kitchens:** 2.5kg catering bags
- **Distributors / bulk:** master cartons and 10kg+ bulk

A good manufacturer will already have these SKUs running. If they need a new line for your pack size, expect 6–8 week MOQs and slower replenishment.

## 6. Lead time, MOQ, and replenishment

For a stable HORECA partner, target:
- MOQ that fits one pallet (not one truck) for first orders
- Replenishment lead time under 10 days within India
- Clear export documentation if you ship overseas

If you're building a national distribution footprint, our [frozen french fries distributor wholesale](/frozen-french-fries-distributor-wholesale) program is designed around exactly these timelines.

## 7. Sample, then scale

Always run a 30-day kitchen trial before signing a supply contract. Cook fries on your own equipment, at your own oil temperature, with your own staff. Spec sheets are useful — kitchen reality is the truth.

## Ready to evaluate a supplier?

The Nilgiri Root manufactures **premium frozen french fries from 100% Nilgiri mountain potatoes**, blast frozen within hours of harvest, FSSAI licensed, and shipped pan-India in 9mm, 10mm, and 11mm cuts.

[Request a quote →](/frozen-french-fries-manufacturer-in-india)$content$,
 '/blog/choose-fries-manufacturer.jpg',
 'How to Choose a Frozen French Fries Manufacturer in India (2026 B2B Guide)',
 'A B2B buyer''s guide to choosing a frozen french fries manufacturer in India. FSSAI, blast freezing, cut sizes, MOQ, and supply consistency explained.',
 'frozen french fries manufacturer india, b2b frozen fries supplier, fssai frozen fries, blast frozen fries india',
 'published', 6, '2026-04-28T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00'),

('b9111d9a-8127-4619-b251-d11df4231136', '2a1e02bc-e3b5-4ec9-8525-746d7d10b123',
 '9mm vs 10mm vs 11mm Frozen French Fries: Which Cut Size Is Right for Your Kitchen?',
 '9mm-vs-10mm-vs-11mm-frozen-french-fries-cut-size-guide',
 'A side-by-side comparison of 9mm, 10mm, and 11mm frozen french fries cut sizes — cook time, oil pickup, plating, and the right pick for QSR, casual dining, and premium HORECA.',
$content$Cut size is the most underrated decision in frozen french fry sourcing. Two kitchens buying from the same manufacturer can serve completely different fries simply because they picked different cuts. Here's how to choose.

## The three workhorse cuts

Indian foodservice runs on three cuts: **9mm**, **10mm**, and **11mm**. Each has a personality.

### 9mm — the shoestring / QSR cut

- **Cook time:** ~2:30 at 175°C
- **Texture:** Maximum surface area, very crisp, light fluffy interior
- **Best for:** QSR, delivery, food courts, Indian snack platters
- **Watch out for:** Over-pickup of oil if your fryer temp drops

The 9mm is the workhorse of fast casual. It cooks fast, drains fast, and survives a 20-minute delivery ride better than thicker cuts. Detailed specs on our [9mm frozen french fries](/frozen-french-fries-9mm) page.

### 10mm — the universal HORECA cut

- **Cook time:** ~3:00 at 175°C
- **Texture:** Balanced crisp-to-fluffy, slight bite
- **Best for:** Casual dining, hotels, banquets, room service
- **Watch out for:** Slight inconsistency between brands — always sample

If you're running a multi-cuisine menu and need one fry that works under burgers, alongside steaks, and as a standalone appetizer, **10mm is the safe choice**. See [10mm frozen french fries](/frozen-french-fries-10mm) for the full spec.

### 11mm — the premium steak cut

- **Cook time:** ~3:45 at 175°C
- **Texture:** Crisp shell, very fluffy potato-forward interior
- **Best for:** Steakhouses, premium plating, buffet (stays hot longer)
- **Watch out for:** Longer cook time = more fryer capacity needed at peak

The 11mm reads "premium" on a plate. It's the cut you want next to a ribeye. Full specs on our [11mm frozen french fries](/frozen-french-fries-11mm) page.

## A quick decision matrix

| You are a... | Pick this cut |
|---|---|
| QSR / delivery brand | 9mm |
| Cloud kitchen, multi-brand | 9mm or 10mm |
| Casual dining chain | 10mm |
| 5-star hotel, banquets | 10mm + 11mm |
| Steakhouse / premium bar | 11mm |
| Café / bistro | 10mm |

## Three things buyers get wrong

**1. Mixing cut sizes in the same fryer.** Don't. The cook times are different — your 9mm will burn while you wait on 11mm.

**2. Choosing cut size by price.** All three cost roughly the same per kg from a reputable manufacturer. Pick by use case, not by ₹/kg.

**3. Skipping the kitchen sample.** Spec sheets don't tell you how a fry behaves in *your* fryer with *your* oil at *your* turnover rate. Always sample first.

## Pack size matters too

Once you've picked your cut, pick your pack:
- [500g packs](/frozen-french-fries-500g) for retail and small kitchens
- [1kg packs](/frozen-french-fries-1kg) for café and cloud kitchen replenishment
- [2.5kg packs](/frozen-french-fries-2.5kg) for HORECA and banquet operations

## Order a multi-cut sample

The Nilgiri Root supplies all three cuts from a single FSSAI-licensed plant, blast frozen for consistency. The quickest way to decide is a multi-cut trial pack.

[Request a multi-cut sample →](/frozen-french-fries-manufacturer-in-india)$content$,
 '/blog/fry-cut-sizes-comparison.jpg',
 '9mm vs 10mm vs 11mm Frozen French Fries: Cut Size Guide for Kitchens',
 'Compare 9mm, 10mm, and 11mm frozen french fries by cook time, texture, and use case. The right cut for QSR, HORECA, and premium kitchens.',
 '9mm frozen french fries, 10mm frozen fries, 11mm steak cut fries, frozen fries cut size',
 'published', 5, '2026-04-27T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00', '2026-04-28T09:27:39.932249+00:00')

on conflict (id) do update set
  category_id = excluded.category_id,
  title = excluded.title,
  slug = excluded.slug,
  excerpt = excluded.excerpt,
  content = excluded.content,
  featured_image = excluded.featured_image,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  meta_keywords = excluded.meta_keywords,
  status = excluded.status,
  reading_time_minutes = excluded.reading_time_minutes,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at;
