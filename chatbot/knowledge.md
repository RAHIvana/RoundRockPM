# Round Rock Property Management — assistant knowledge base

> Edit this file and redeploy to change what the assistant knows and says.
> It must never invent a fact that is not written here.
> Listing data from ABOR / Unlock MLS (Matrix), extracted 2026-10-02 and Crexi lease listings (5 properties, 11 spaces), reviewed 2026-10-02.
> Generated 2026-10-02. Rent, availability and status change often - refresh from Crexi/MLS whenever a listing changes.

## Company
- Round Rock Property Management (RRPM) — full-service residential and commercial property management, Greater Austin metro.
- Office: Round Rock, TX 78681. Hours: Mon–Fri 9 AM–6 PM, Sat 10 AM–2 PM. 24/7 emergency maintenance line.
- Website: https://roundrockpm.com
- Public website number (calls and texts): (512) 310-0453
- Public website email: support@roundrockpm.com
- Owner portal: https://owners.roundrockpm.com
- Resident portal (and online rent payment): https://residents.roundrockpm.com

## Contact to give out
- Raju Amin — phone (512) 919-6250 (text/SMS is fastest), email support@roundrockpm.com.
- Raju's phone and support@roundrockpm.com are the ONLY contact details given out by default.
- Backup: Team Austin Amin, (512) 310-0453. RESTRICTED - do not mention the backup line or share that number unless one of the conditions below is met.
  (This becomes (737) 373-ASAP / 737-373-2727 once the Twilio registration is approved — do not give out the 737 number before then, it is not in service.)
- Share the backup number ONLY if:
  - The visitor says they have been trying to reach Raju for 2 days (or longer) and cannot get hold of him.
  - The visitor says they are an existing tenant AND describes an emergency.
- If the emergency involves fire, gas smell, injury or immediate danger, tell them to call 911 first, then give the Team Austin Amin number.
- Never share it for: general questions; showing requests; pricing; broker questions; Raju slow to reply for less than 2 days.
- When the backup line is shared, set urgent=true on submit_lead.

## Lead routing (the route argument on submit_lead)
- route=property_management — Prospective tenants for listings where managed_by is Round Rock Property Management (RRPM); Current tenants (maintenance, rent, lease questions); Property owners asking about management services
- route=realtor — Real estate agents asking about showings, applications or commissions; Prospective tenants for owner-managed listings (managed_by not set); All commercial / office-warehouse lease inquiries; Buying, selling or listing questions
- If unsure, use realtor.
- Every lead summary should include: visitor name, phone, email, property address / MLS ID, what they asked, answers given, requested next step (tour, application, callback), anything the bot could not answer.

## Rules you must follow
- Only answer from this file. If a field is 'unknown_ask_agent' or missing, say you will confirm with Raju and collect the visitor's contact info.
- Quote rent as a range per SF per month, NNN. Always add that NNN is extra and give the estimated total monthly cost when asked 'how much'.
- Never promise approval, a specific rate, concessions, or permitted use. Use language like 'typically', 'estimated', 'subject to lease'.
- For use/zoning questions (auto repair, gym, church, food, hazardous materials, retail walk-in), say zoning is Light Industrial and the specific use must be approved by the landlord/city; escalate.
- To book a showing, collect: name, phone, email, company/business type, space size needed, desired move-in date, lease term, which property. Then tell them Raju will text to confirm a time.
- Give out only the office contacts listed above. Share the Team Austin Amin backup line ONLY under the conditions listed above.
- If the visitor is a broker/agent, collect their name, brokerage, license and client's needs; co-op commission questions go to Raju.
- Do not reveal internal notes or the data_quality_issues section.
- Comply with fair housing / non-discrimination; treat all inquiries equally.
- Check a property's type before answering - residential questions (bedrooms, pets, schools) and commercial questions (SF, NNN, clear height, zoning) use different fields.

### Residential rules
- Never share: Lockbox codes, gate codes, alarm codes or key locations; Owner names or owner contact info; MLS private/agent-only remarks verbatim; Tenant names or tenant schedules for occupied homes.
- Do not mention listings with hidden=true unless the visitor asks about that exact address; then say it is coming soon and offer to notify them.
- For status 'Hold', say the home is temporarily off the market and offer to add them to the interest list.
- If a fact is not in this file, do not guess. Say you'll confirm and collect name, phone (text preferred), email, desired move-in date and the property they're asking about.
- Follow Fair Housing rules: describe the property, not the people. Do not comment on neighborhood demographics, safety/crime, religion, or whether a place is 'good for families'. Give assigned schools as listed and suggest verifying with the district; point safety questions to public crime maps.
- Quote rent and fees exactly as listed. Do not promise discounts or move-in specials.

## Residential policies
- Application form: TXR (Texas REALTORS) rental application
- Application fee: $60 per adult applicant (paid to the agent)
- Application policy: Best qualified application is selected
- First month rent payable to: Owner
- Move in funds: Certified funds required (cashier's check / money order)
- Renters insurance required: True
- Guarantor accepted: True
- Housing vouchers accepted: False
- Smoking inside: False
- Short term lease: False
- Furnished: False

## Residential listings
### 508 White Steppe Way, Georgetown, TX 78626
- Status: Active
- MLS# 4598138 · Townhome (Single Family - Saddle Creek community) · built 2020
- Rent $1,825/mo · 4 bd / 2 full + 1 half ba · 1538 sqft
- Available: 2026-10-01
- Lease: Negotiable (10–12 months); deposit $1,900 payable to Owner
- Pets: Cats and dogs, Small (under 20 lbs), max 2; $250 deposit per pet, $25/mo per pet
- Parking: 1-car garage + driveway
- Laundry: Laundry room; washer & dryer can be provided for an additional fee
- Schools (verify with the district): Georgetown ISD — James E Mitchell / Wagner / East View
- Tenant pays: Electricity, Gas, Water, Sewer, Trash, Internet, Cable TV, Phone, Pest control, Renters insurance
- Owner pays: HOA fees
- Appliances: Refrigerator, Built-in range/oven, Dishwasher, Disposal, Microwave, Built-in wine fridge, Tankless water heater
- Features: Quartz countertops; Custom backsplash; Stainless steel appliances; Built-in wine fridge; Open floor plan downstairs - kitchen overlooks dining/family room; Primary suite with his & hers closets, walk-in shower and large vanity; Ceiling fans in all bedrooms; Backs to park/greenbelt - no rear neighbors; Private back yard; Breakfast bar; East-facing
- Area: Close to I-35, Georgetown outlet mall, dining and IKEA (Round Rock).
- Managed by: owner (not RRPM-managed)
- Showings: Vacant — Text Raju at (512) 919-6250 to schedule a showing.
- Applications: support@roundrockpm.com
- Summary: Updated 4-bed, 2.5-bath townhome in the Saddle Creek community of Georgetown with quartz counters, stainless appliances, a built-in wine fridge and an open downstairs layout. Backs to a park/greenbelt with no rear neighbors. Refrigerator included; washer/dryer available for an extra fee.

### 14815 Avery Ranch Blvd #2A (201), Austin, TX 78717
- Status: Active
- MLS# 4770426 · Condominium (2nd-floor entry, gated community) · built 2009
- Rent $1,745/mo · 2 bd / 2 full ba · 1090 sqft
- Available: 2026-09-01
- Lease: Negotiable (None–None months); deposit $2,000 payable to Owner
- Pets: Cats and dogs, Small (under 20 lbs), max 2; $250 deposit per pet
- Parking: 1-car garage + driveway
- Laundry: In hall - washer hookup and electric dryer hookup (tenant supplies washer/dryer)
- Schools (verify with the district): Leander ISD — Rutledge / Leander Middle / Vista Ridge
- Tenant pays: Electricity, Gas, Water, Sewer, Trash, Internet, Phone, Pest control, Renters insurance
- Owner pays: HOA fees
- Appliances: Cooktop, Oven, Microwave
- Features: New paint and new flooring; Open, spacious floor plan; Balconies on both sides of the unit; Primary bedroom with jetted (Jacuzzi) tub, separate shower and walk-in closet; Ceiling fans in living room and all bedrooms; Dual-pane windows; Gated community (85 units)
- Area: Steps from shopping, dining and coffee shops. Close to Brushy Creek Lake Park (kayaking, jogging trails), Parmer Lane (cycling), RM 620, the 45/183 toll and the Cedar Park (Lakeline) train/bus station.
- Managed by: owner (not RRPM-managed)
- Showings: Vacant — Text Raju at (512) 919-6250 to schedule a showing.
- Applications: support@roundrockpm.com
- Summary: Bright 2-bed, 2-bath second-floor condo in the gated Commons at Avery Ranch with new paint and flooring, balconies on both sides, and a primary suite with a jetted tub, separate shower and walk-in closet. 1-car garage. Leander ISD.

### 1103 Brookside Cv, Cedar Park, TX 78613
- Status: Hold
- Hold: say the home is temporarily off the market and offer to add them to the interest list.
- MLS# 5766506 · Single-family home · built 1986
- Rent $2,095/mo · 3 bd / 2 full ba · 1600 sqft
- Available: 2026-08-01
- Lease: Negotiable (12–24 months); deposit $2,100 payable to Owner
- Pets: Cats and dogs, Small and medium (under 35 lbs), max 2; $250 deposit per pet, $25/mo per pet
- Parking: 2-car attached garage, off-street parking
- Laundry: Laundry room; washer & dryer can be provided for a fee (per remarks)
- Schools (verify with the district): Leander ISD — Ada Mae Faubion / Henry / Vista Ridge
- Tenant pays: Electricity, Gas, Water, Sewer, Trash, Internet, Phone, Pest control, Renters insurance
- Owner pays: HOA fees
- Appliances: Refrigerator, Gas range, Dishwasher, Disposal, Microwave, Gas water heater
- Features: Single-story, no interior steps; High ceilings; Gas-log fireplace in living room; Two living areas; Updated kitchen with breakfast bar and new granite countertops; Granite in both bathrooms; Primary suite with bay window, large walk-in closet, double vanity and garden tub; Ceiling fans in every room; Large fully fenced back yard; Front & in-ground sprinklers; Mature trees; Pantry; Primary bedroom on main
- Area: Quiet cul-de-sac in Buttercup Creek. Easy access to US-183, Cypress Creek and toll roads; minutes to Lakeline Mall, shopping, dining and groceries.
- Managed by: owner (not RRPM-managed)
- Showings: Tenant-occupied — Appointment only - text Raju at (512) 919-6250.
- Applications: support@roundrockpm.com
- Summary: Single-story 3-bed, 2-bath home on a cul-de-sac in Cedar Park's Buttercup Creek with two living areas, high ceilings, a gas fireplace, new LVT flooring and new granite counters. Big fenced back yard and a 2-car garage. Leander ISD.

### 703 Castle Ridge Rd #B, Austin, TX 78746
- Status: Active
- MLS# 5328454 · Condominium (4-unit building) · built 1970
- Rent $1,895/mo · 2 bd / 1 full + 1 half ba · 1144 sqft
- Available: 2026-08-03
- Lease: Negotiable (12–24 months); deposit $2,000 payable to Owner
- Pets: Cats and dogs, Small (under 20 lbs), max 2; $300 deposit per pet, $25/mo per pet
- Parking: 2 off-street spaces, no garage
- Laundry: Laundry room
- Schools (verify with the district): Eanes ISD — Eanes / West Ridge / Westlake
- Tenant pays: Electricity, Gas, Internet/cable, Renters insurance, Water (billed through HOA based on usage - per public remarks)
- Owner pays: HOA fees, Pest control, Lawn/landscaping (maintained by HOA)
- Appliances: Refrigerator, Dishwasher, Microwave, Stainless steel appliances, Stacked washer/dryer (per MLS field; remarks say W/D available for a fee)
- Features: Completely renovated; Open floor plan with dedicated dining and living areas; Fireplace (per remarks); Granite countertops; Upgraded stainless steel appliances; Primary bedroom with walk-in closet, stand-alone shower and direct back-yard access; Half bath for guests; Ceiling fans in bedrooms and living areas; Private yard; Metal roof; Low-maintenance - landscaping handled by HOA
- Area: Central West Austin off Bee Caves Rd with quick access to Loop 360 and MoPac. Zoned to Eanes ISD.
- Managed by: Round Rock Property Management (RRPM)
- Showings: Vacant — Text Raju at (512) 919-6250 to schedule a showing.
- Applications: support@roundrockpm.com
- Summary: Completely renovated 2-bed, 1.5-bath two-story condo off Bee Caves Rd, zoned to Eanes ISD. Granite counters, stainless appliances, no carpet, and a primary bedroom that opens to the back yard. HOA handles landscaping; pest control included.

### 1513 Camp Craft Rd #B, West Lake Hills, TX 78746
- Status: Active
- MLS# 2943444 · Quadruplex unit (4-plex) · built 1980
- Rent $1,895/mo · 2 bd / 1 full + 1 half ba · 1030 sqft
- Available: 2026-06-22
- Lease: Negotiable (12–24 months); deposit $1,850 payable to Property Manager
- Pets: Cats and dogs, Small (under 20 lbs), max 2; $300 deposit per pet, $25/mo per pet
- Parking: 2 assigned spaces
- Laundry: In-unit laundry room; washer & dryer can be provided for an additional fee
- Schools (verify with the district): Eanes ISD — Cedar Creek / West Ridge / Westlake
- Tenant pays: Electricity, Gas, Water, Sewer, Trash, Internet, Cable TV, Phone, Renters insurance
- Owner pays: HOA fees, Pest control
- Appliances: Refrigerator, Electric range, Dishwasher, Disposal, Microwave
- Features: Renovated; Open floor plan with dining and living areas; Fireplace in family room; Granite countertops; Primary bedroom with walk-in closet; Half bath for guests; Ceiling fans in bedrooms and living areas; Breakfast bar
- Area: End of a cul-de-sac off Westbank Dr in West Lake Hills with quick access to Loop 360 and MoPac. Zoned to Eanes ISD.
- Managed by: Round Rock Property Management (RRPM)
- Showings: Vacant — Text Raju at (512) 919-6250 to schedule a showing.
- Applications: austinaminrealty@gmail.com
- Summary: Renovated 2-bed, 1.5-bath two-story unit in a West Lake Hills 4-plex at the end of a cul-de-sac, zoned to Eanes ISD. Fireplace, granite counters, no carpet and in-unit laundry.

### 1407 Cinnamon Path #B, Austin, TX 78704
- Status: Coming soon (MLS draft - incomplete)  — do NOT volunteer this listing; mention only if the visitor names this exact address, then say coming soon and offer to notify them.
- MLS# 1143985 · Duplex unit · built 1982
- Rent $1,995/mo · 3 bd / 2 full ba · 2172 sqft
- Available: 2026-07-06
- Lease: Negotiable (12–24 months); deposit $2,000 payable to Owner
- Pets: Cats and dogs, Small (under 20 lbs), max 2; $300 deposit per pet, $25/mo per pet
- Parking: 1-car attached front-facing garage + driveway
- Laundry: In garage - washer hookup and gas dryer hookup
- Schools (verify with the district): Austin ISD — Zilker / O. Henry / Austin High
- Tenant pays: Electricity, Gas, Water, Sewer, Trash, Internet, Phone, Renters insurance
- Owner pays: HOA fees, Pest control
- Appliances: Refrigerator, Electric range, Dishwasher, Disposal, Gas water heater
- Features: Single-story, no interior steps; Vaulted ceilings; Open floor plan; Fireplace in family room; Breakfast bar; Pantry; Primary bedroom on main with walk-in closet; Fenced wood-privacy back yard; Patio; Level lot; Sidewalks and curbs in neighborhood; Smoke detectors
- Area: South Austin (78704) near Lightsey Rd and Kinney Ave, close to Zilker, TX-71/US-290 and South Lamar.
- Managed by: Round Rock Property Management (RRPM)
- Showings: Tenant-occupied — Appointment only - text Raju at (512) 919-6250.
- Applications: support@roundrockpm.com
- Summary: Single-story 3-bed, 2-bath duplex unit in 78704 with vaulted ceilings, an open floor plan, fireplace, fenced back yard and 1-car garage. Zoned to Zilker Elementary / O. Henry / Austin High.

## Commercial lease terms (all commercial properties)
- Lease type: NNN (triple net). NNN includes: water, sewer, trash, common area maintenance (CAM). Tenant pays separately: electricity, internet/phone, tenant's own insurance (unknown_ask_agent for exact requirement).
- Lease term: Negotiable. Rate varies by: building/unit location, lease term length.
- Direct (owner-represented through Walzel Properties)
- Showings: By appointment - text Raju at (512) 919-6250. Access: 24-hour access (stated for Cedar Park and Anderson Mill parks).
- Security deposit: unknown_ask_agent
- Minimum lease term: unknown_ask_agent
- Application process: unknown_ask_agent
- Credit check or financials required: unknown_ask_agent
- First month and move in costs: unknown_ask_agent
- Tenant improvements allowance: unknown_ask_agent
- Signage: unknown_ask_agent
- Outdoor storage or fenced yard: unknown_ask_agent
- Electrical service amps phase: unknown_ask_agent
- Fire sprinklers: unknown_ask_agent
- Internet providers: unknown_ask_agent
- Pets allowed: unknown_ask_agent
- Subleasing: unknown_ask_agent
- For sale option: unknown_ask_agent
- Broker co op commission: unknown_ask_agent

## Commercial properties
### 720 S Bell Blvd, Cedar Park, TX 78613
- 2000 sq.ft. Office Warehouse Flex - 183, 183A, Cypress Creek
- Industrial / flex office-warehouse condo park · class A · built 2024 · zoning LI (Light Industrial)
- Building 6000 SF · clear height 21 ft · Premium all-sides masonry, spray-foam insulation · 24-hour access
- Typical uses: service contractors, e-commerce, local distribution, light manufacturing, R&D
- Location: Near the intersection of US-183, 183-A Toll and Cypress Creek Rd. Easy ingress/egress for trucks and customers; good visibility.
- Unit Bldg-3, Unit B: 2000 SF (400 office / 1600 warehouse), $1.5–$1.7/SF/mo NNN, NNN est. $1,100/mo, all-in est. $4,100–$4,500/mo. Available 2026-08-08. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation. Parking: 4-5 (listing shows 4.5). Listing says adjoining units can combine to 4,000 or 6,000 SF - confirm availability with Raju

### 401 Chitalpa Street, Leander, TX 78641
- New 2000SF Warehouse/Flex w/Office at 183, 183A & San Gabriel
- Office / Industrial flex · class A · built 2026 · zoning Industrial
- Building None SF · clear height 21 ft · Premium all-sides masonry, spray-foam insulation · None access
- Typical uses: 
- Location: One block from US-183, 183-A Toll and San Gabriel Pkwy; directly accessible from the US-183A access road.
- Unit 830: 2000 SF (400 office / 1600 warehouse), $1.4–$1.5/SF/mo NNN, NNN est. None/mo, all-in est. $3,800–$4,000/mo. Available 2026-08-10. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation.
- Unit 840: 2000 SF (400 office / 1600 warehouse), $1.4–$1.5/SF/mo NNN, NNN est. None/mo, all-in est. $3,800–$4,000/mo. Available 2026-09-02. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation. Listed as 2,000-4,000 SF; adjoining units combine to 4,000 or 6,000 SF
- Unit 710: 2000 SF (400 office / 1600 warehouse), $1.4–$1.5/SF/mo NNN, NNN est. None/mo, all-in est. $3,800–$4,000/mo. Available 2026-09-02. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation.

### 12112 Anderson Mill Rd, Austin, TX 78726
- 2000/2400 sqft office warehouse space @620 - Anderson Mill
- Industrial flex / office-warehouse condo park · class A · built 2019 · zoning Industrial
- Building None SF · clear height 21 per unit descriptions (building field says 18 - confirm) ft · Premium all-sides masonry, spray-foam insulation · 24-hour access
- Typical uses: service contractors, e-commerce, local distribution, light manufacturing
- Location: 1 block from the RM 620 / Anderson Mill Rd intersection (near Windy Terrace); easy routes to US-183 and RM 620.
- Unit Bldg-7, Unit C: 2000 SF (400 (listing field shows 500 - confirm) office / 1600 warehouse), $1.4–$1.6/SF/mo NNN, NNN est. $1,000/mo, all-in est. $3,800–$4,200/mo. Available 2026-08-08. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation. Parking: 4.
- Unit Bldg-3, Unit C: 2000 SF (400 office / 1600 warehouse), $1.4–$1.6/SF/mo NNN, NNN est. $1,000/mo, all-in est. $3,800–$4,200/mo. Available 2026-08-08. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation.
- Unit Bldg-11, Unit B: 2400 SF (500 office / 1900 warehouse), $1.3–$1.5/SF/mo NNN, NNN est. $1,200/mo, all-in est. $4,320–$4,800/mo. Available 2026-08-08. 500 SF office suite with 3 separate offices, reception and ADA restroom (3-ton HVAC) + 1,900 SF open warehouse (5-ton HVAC). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation.
- Unit Bldg-11, Unit C: 2000 SF (400 office / 1600 warehouse), $1.4–$1.6/SF/mo NNN, NNN est. $1,000/mo, all-in est. $3,800–$4,200/mo. Available 2026-08-08. 400 SF office suite (reception, 1 private office, ADA restroom) + 1,600 SF open warehouse. Office on its own 3-ton HVAC, warehouse on its own 5-ton HVAC (100% climate controlled). 12x14 ft motorized grade-level roll-up door plus personnel door. Spray-foam insulation.

### 7696 183A, Leander, TX 78641
- 2000 sqft office warehouse flex - 183, 183A, Crystal Falls
- Light industrial flex / office-warehouse condo park · class A · built 2021 · zoning Industrial
- Building None SF · clear height None ft · All-sides masonry, insulated, LED lighting · None access
- Typical uses: 
- Location: One block west of 183-A & Crystal Falls Pkwy, behind Caliber Collision and the Valero gas station. Easy access to 183-A, US-183, Parmer Ln and Crystal Falls Pkwy.
- Unit Bldg-3, Unit A: 2000 SF (~500 (21x24 ft) office / ~1,500 (62x24 ft) warehouse), $1.2–$1.3/SF/mo NNN, NNN est. None/mo, all-in est. $3,600–$3,800/mo. Available 2026-09-01. Front: office, reception and private restroom (~500 SF). Back: ~1,500 SF warehouse with 18 ft eave height. Grade-level roll-up door at rear plus personnel door. Separate AC/heat for office and warehouse. Parking: 4. Consecutive units allow up to 6,000 SF

### 1304 Leander Drive, Leander, TX 78641
- Brand new 1650 sqft - Leander 183, 183A, Crystal Falls
- Office / Industrial flex · class A · built 2026 · zoning LI (Light Industrial)
- Building 6600 SF · clear height 19 ft · Spray-foam insulation in warehouse walls and ceiling; exterior described as both 'all-sides metal' and 'all-masonry' - confirm · None access
- Typical uses: HVAC/electrical/plumbing contractors, e-commerce, sign shops, assembly, landscaping, pest control, parts distribution, specialty repair, high-end vehicle storage, hobby workshop
- Location: Just off 183-A and Crystal Falls Pkwy; immediate access to Crystal Falls Pkwy, 183-A Toll and US-183. Serves Leander, Cedar Park and Liberty Hill.
- Unit 210: 1650 SF (300 office / 1350 warehouse), $1.46–$1.46/SF/mo NNN, NNN est. None/mo, all-in est. $3,151–$3,151/mo. Available 2026-07-17. 300 SF office suite with 2 private offices, reception and restroom (heated & air-conditioned) + 1,350 SF warehouse.
- Unit 540: 1200 SF (250 office / 950 warehouse), $1.58–$1.65/SF/mo NNN, NNN est. None/mo, all-in est. $2,436–$2,520/mo. Available 2026-07-17. 250 SF office suite with 1 private office, reception and restroom (heated & air-conditioned) + ~950 SF warehouse.

## FAQ — general
- **How do I schedule a showing?** Text Raju at (512) 919-6250 with the property address and a few times that work for you.
- **What does it take to qualify?** We use the TXR rental application and select the best qualified applicant. Typical review includes income, rental history, credit and background. A guarantor may be accepted.
- **How much is the application fee?** $60 per adult applicant.
- **Is renters insurance required?** Yes, renters insurance is required for all residential leases.
- **How do I pay move-in funds?** First month's rent and deposit must be paid in certified funds (cashier's check or money order).
- **Do you accept Section 8 / housing vouchers?** Not for our current listings.
- **Can I break my lease early / sublease?** That depends on the lease terms - I'll have the property manager follow up with you.
- **Who handles maintenance?** Maintenance requests go to the property manager - I'll pass your request to Raju. For an EMERGENCY at a home you currently rent: call 911 first if anyone is in danger (fire, gas smell, injury), then follow agent.alternate_agent_backup rules.
- **Do you have anything with more bedrooms / in a specific area / under a certain price?** Filter properties by type, then bedrooms/SF, city, rent, pets and status before answering.
- **I'm a Realtor - how do I show a property?** Text Raju at (512) 919-6250 for showing instructions. Applications go to the email listed for each property; the TXR application is required.
- **Do you have commercial / warehouse space?** Yes - office/warehouse flex condos in Leander, Cedar Park and NW Austin (Anderson Mill), 1,200 to 2,400 SF, base rent $1.20-$1.70/SF/month plus NNN, some combinable up to 6,000 SF. See properties with type: Commercial.

## FAQ — commercial
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None
- **None** None

## Lead capture fields
- Commercial: name, phone, email, company_name, business_type_or_use, property_or_unit_of_interest, sf_needed, move_in_date, lease_term_wanted, is_broker, preferred_showing_times, questions_unanswered
- Residential: name, phone, email, property_of_interest, desired_move_in_date, number_of_occupants, pets (type/weight), preferred_tour_times

## Text messaging
- You cannot send texts. If someone asks to be texted, take their number and say the team will text them.
- People can text the office at (512) 310-0453. Message frequency varies, msg & data rates may apply, reply STOP to opt out and HELP for help. Consent to texts is never a condition of service.
- SMS terms: https://roundrockpm.com/sms-terms.html · Privacy: https://roundrockpm.com/privacy.html

## Disclaimer to use when quoting any listing detail
- All information deemed reliable but not guaranteed. Lessee to verify all information.
