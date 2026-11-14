# MAHĀBHĀRATA — The Carved Wall

A director's treatment for the whole website. The Bhagavad Gītā wall built so far becomes one chapter of it, Act V, Day One.

Status: **story treatment only.** Nothing in this file is built yet except the Gītā scenes marked ✅. Every scene below becomes one carved panel (one ChatGPT plaster render → `make_scene.sh` → one `[data-scene]` section), built one at a time and approved before the next.

---

## 1. Director's note

**The idea in one line:** the wall is the epic being _written_. Vyāsa speaks, the scribe carves, and every time your cursor passes, a memory of the story rises out of the plaster and sinks back. When you stop moving, the wall forgets. You have to keep looking for the story to stay.

**Two directors, one film.**

- _Rajamouli_ gives us **elevation**. These are hero moments seen from the ground looking up, held a breath too long, with the music falling silent just before them. He builds emotion before action, so every fight is a promise kept or broken. And an **interval bang** splits the film in two (here, the dice hall).
- _Hollywood epic_ (Lean, Villeneuve) gives us **restraint**: enormous wides with tiny figures, long silences, and sound that comes from the world (wind, bronze bells, horses breathing) rather than score.

**Rules for every scene** (from the user's standing direction):

1. **Connected, never repeated.** Each panel keeps the same people, costumes, chariots and plaster as the last, but uses a new camera, a new scale and a new composition. No shot is used twice. Each scene below names its camera.
2. **One coherent ivory plaster**, carved in soft, thick, organic high relief (the studio-still style), backgrounds carved too. Never a blank wall behind a figure.
3. **Story from the text, symbols marked.** Scenes follow Vyāsa's _Mahābhārata_. Where a famous moment comes from later retellings rather than the Critical Edition (Pune, BORI), it is marked **(tradition)**, and the site's copy says "it is told that…". Symbolic panels are marked **(symbolic)**.
4. **No quoted verse** until a verified edition and reusable translation are in place. All on-screen words are original editorial copy.
5. **Dignity in violence.** The site shows the cost of the war, not gore. The dice-hall humiliation is told from Draupadī's strength, never as spectacle on her body.

**Visual arc (the plaster's light over the whole film).**

| Act        | Light on the wall                    | Feeling              |
| ---------- | ------------------------------------ | -------------------- |
| Prologue   | candle-warm ivory, very low light    | a secret being told  |
| I Roots    | morning river light, soft and silver | innocence, vows      |
| II Dice    | gold, then a hard overhead white     | glory, then exposure |
| _Interval_ | wall goes dark, sound stops          | the cut              |
| III Exile  | green-grey forest shade, moon        | endurance            |
| IV Embassy | flat noon, no shadows to hide in     | the last chance      |
| V War      | dust-amber, sunset, torch-night      | fate                 |
| VI Ash     | grey dawn, smoke                     | grief                |
| VII Return | snow-white, then pure light          | release              |

**Sound arc (our synthesised score in `src/sound.ts`).** The tanpura drone is the thread through the whole film. Each act retunes it rather than replacing it:

- I: Sa–Pa with a river hush.
- II: brighter and faster, with small bells, then the drone _stops dead_ for the interval.
- III: lower, with night insects.
- IV: a single held Sa.
- V: conches, wind, war drums low under the drone.
- VI: drone with no plucks, only wind.
- VII: the drone rises an octave and thins away to silence.

**Recurring motifs** (carve them small and repeat them; the audience will feel the rhyme):

- **The river Gaṅgā.** It births Bhīṣma, carries baby Karṇa, flows under the arrow-bed, and holds the dead on the night they return.
- **The wheel.** The chariot wheel; Krishna lifting a wheel against Bhīṣma; Abhimanyu fighting with a wheel; Karṇa's wheel sinking. The wheel is time.
- **Dice.** A tiny pair carved somewhere in every act after Act II, never pointed at.
- **Fire.** Draupadī and her brother born from fire, the lacquer house, the burning forest, the pyres.
- **Banners.** Hanumān on Arjuna's flag, the elephant-rope on Karṇa's, the palm on Bhīṣma's. The banner tells you who is in the shot before the face does.

---

## 2. Cast as carved (keep them identical in every render)

| Character              | How the wall shows them                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Vyāsa**              | very old, matted hair to the waist, dark skin, bare chest, rudrākṣa beads; the storyteller    |
| **Gaṇeśa** (tradition) | the scribe; one tusk broken, used as the stylus                                               |
| **Bhīṣma**             | tall, white hair and beard, white garments, palm-tree banner; always stands straight          |
| **Kuntī**              | dignified, plain white in widowhood; hands often near her heart                               |
| **Gāndhārī**           | a folded cloth over her eyes, from her wedding day to her death                               |
| **Dhṛtarāṣṭra**        | huge, powerful, blind; hands always reaching                                                  |
| **Yudhiṣṭhira**        | calm, spear, few ornaments; the eldest Pāṇḍava                                                |
| **Bhīma**              | massive shoulders, mace, the hungriest and the gentlest; Vāyu's son                           |
| **Arjuna**             | as in our Gītā panels: Gāṇḍīva bow, quiver, Hanumān banner                                    |
| **Nakula & Sahadeva**  | twins; Nakula with horses, Sahadeva with a sword, a scroll of stars                           |
| **Draupadī**           | dark-skinned, tall, eyes like lotus petals; long hair (unbound after the dice until Act V)    |
| **Krishna**            | as in our Gītā panels: dark, peacock feather (tradition), flute at the waist, the reins       |
| **Karṇa**              | golden armour grown into his skin and earrings at birth (until Act III); elephant-rope banner |
| **Duryodhana**         | proud jaw, mace; the eldest Kaurava                                                           |
| **Duḥśāsana**          | Duryodhana's shadow                                                                           |
| **Śakuni**             | thin, a limp (tradition), the dice always in his hand                                         |
| **Droṇa**              | the teacher, a brahmin with a bow; grey topknot                                               |
| **Aśvatthāmā**         | Droṇa's son; a jewel set in his forehead                                                      |
| **Abhimanyu**          | sixteen, Arjuna's son; a smaller copy of his father                                           |
| **Ghaṭotkaca**         | Bhīma's rākṣasa son; a giant, bald, laughing                                                  |

---

## 3. The film, scene by scene

Each scene lists:

- **Shot:** camera and composition.
- **Light**
- **Carving:** what rises under the cursor.
- **Sound**
- **Words:** original on-screen line, a draft for approval.

### PROLOGUE: The Dictation

**P1 · The cave.**

- **Shot:** extreme wide, Himalayan cave mouth, tiny lamp, snow outside.
- **Light:** one lamp.
- **Carving:** Vyāsa seated, mouth open in speech; Gaṇeśa (tradition) with a palm-leaf stack, writing.
- **Sound:** wind only; then the first tanpura pluck.
- **Words:** "An old poet asked for a scribe who would never stop. The scribe asked for a poet who would never pause."

**P2 · The broken tusk** (tradition).

- **Shot:** macro close-up of Gaṇeśa's hand; the stylus snaps, and he breaks his own tusk to keep writing.
- **Light:** lamp flare.
- **Carving:** letters forming in the leaf as forms, not readable text.
- **Sound:** a crack, then silence.
- **Words:** "The story was too long for one pen."

**P3 · The leaves become the wall.**

- **Shot:** pull back. Palm leaves fly out of the cave and become the plaster we are scrolling along.
- **Carving:** leaves dissolving into the carved river of Act I.
- **Words:** "What follows is the story of one family, and of everyone."

### ACT I: ROOTS (Ādi Parva)

**I.1 · The river woman.**

- **Shot:** low, at water level; King Śantanu on the bank, Gaṅgā rising out of the river.
- **Light:** silver morning.
- **Carving:** water patterns, lotus, a hunting bow dropped in the grass.
- **Sound:** river.
- **Words:** "A king loves a woman who asks him one thing: never question what she does."

**I.2 · Seven sons, and the eighth.**

- **Shot:** top-down over the river. Seven small ripples, then the king's arm reaching to stop the eighth.
- **Carving:** the baby Devavrata held up; Gaṅgā walking back into the water.
- **Words:** "He kept his promise seven times. The eighth time, he spoke, and she left with the child."
- (Text: the seven sons were cursed Vasus being released, in the Critical Edition.)

**I.3 · The terrible vow.** _(the first elevation shot of the film)_

- **Shot:** extreme low angle. Young Devavrata stands before the fisher-chief, arm raised, sky behind him filled with the gods.
- **Light:** hard backlight.
- **Carving:** flowers falling from the sky; Satyavatī on her boat in the distance.
- **Sound:** the drone cuts to silence, then one deep bell.
- **Words:** "So that his father could marry, he gave up the throne and every child he would ever have. The sky named him Bhīṣma, the one of the terrible vow."

**I.4 · Ambā's oath.**

- **Shot:** wide, three princesses on a chariot leaving the swayamvara. Cut to a lone woman entering the forest fire of her penance.
- **Carving:** Ambā alone, hair loose, facing the left edge (where Bhīṣma will fall in Act V).
- **Words:** "Taken, then refused by everyone, Ambā swore she would be the reason Bhīṣma fell. She would wait a lifetime for it."

**I.5 · Three sons of the sage.**

- **Shot:** triptych, three doorways side by side.
  - Ambikā shuts her eyes, and the blind Dhṛtarāṣṭra is born.
  - Ambālikā turns pale, and the pale Pāṇḍu is born.
  - The maid looks with calm, and the wise Vidura is born.
- **Light:** dark / pale / warm.
- **Words:** "A blind son, a pale son, and a wise son. The throne would go to none of them easily."

**I.6 · The sun's child.**

- **Shot:** wide river at dawn, a basket floating, a golden glow under its lid. On the bank, the girl Kuntī turns away.
- **Carving:** the baby with armour grown into his chest and earrings shining; the charioteer Adhiratha wading in on the far right.
- **Sound:** the river from I.1 returns, now sad.
- **Words:** "A girl called on the sun to see if the mantra worked. It did. She was alone, and she let the river take him."

**I.7 · The blindfold.**

- **Shot:** frontal close-up, Gāndhārī lifting a folded cloth to her own eyes; the wedding pavilion behind.
- **Words:** "Told her husband could not see, she chose never to see more than he did."

**I.8 · The deer that was a man.**

- **Shot:** a forest seen through leaves. Pāṇḍu's arrow is in flight; two deer, one of them a sage.
- **Carving:** after the cut, Pāṇḍu's hands dropping the bow.
- **Words:** "One arrow, and a curse: if he ever embraced his wife, he would die."

**I.9 · Five sons from the gods.**

- **Shot:** sky panel, five lights descending onto the forest hermitage: Dharma, Vāyu, Indra and the twin Aśvins.
- **Carving:** Kuntī and Mādrī each holding infants; the god-forms large and soft in the clouds (symbolic).
- **Words:** "Through Kuntī's mantra, five sons were born of the gods: Yudhiṣṭhira, Bhīma, Arjuna, Nakula and Sahadeva."

**I.10 · A hundred jars.**

- **Shot:** an underground chamber of a hundred clay jars in rows receding to a vanishing point; Gāndhārī standing at the far end.
- **Light:** lamplight on curved clay.
- **Words:** "Gāndhārī bore a hundred sons, and a daughter. The eldest was Duryodhana."

**I.11 · Bhīma under the river.**

- **Shot:** underwater, looking up. Bhīma, bound and drugged, sinks; serpents rise to meet him.
- **Carving:** nāga coils, bubbles, light from above.
- **Words:** "Poisoned by his cousin and thrown into the Gaṅgā, Bhīma came back stronger."

**I.12 · The bird's eye.**

- **Shot:** over the shoulder from behind Arjuna, the bow drawn. The tree, the brothers and the teacher are soft; only the bird's eye is sharp.
- **Carving:** depth of field done in relief, with the eye deepest and everything else shallow.
- **Words:** "'What do you see?' The others saw the tree. Arjuna saw only the eye."

**I.13 · Ekalavya's thumb.**

- **Shot:** a forest clearing, a clay statue of Droṇa. A tribal boy kneels before the real Droṇa and holds out his hand.
- **Light:** dim, the colour draining.
- **Words:** "He learned from a statue of the teacher who refused him. The fee was his right thumb. He paid it without a word."

**I.14 · The tournament: the stranger enters.** _(elevation)_

- **Shot:** a low wide across the arena sand. The crowd is a carved sea; one figure in golden armour stands at the gate, the sun directly behind his head.
- **Sound:** the crowd holds its breath.
- **Words:** "Everything Arjuna did, the stranger did as well."

**I.15 · The king of Aṅga.**

- **Shot:** a two-shot. Duryodhana places a crown on Karṇa; an old charioteer hurries in, and Karṇa bows to touch his feet.
- **Carving:** Kuntī in the stands, fainting (Vidura's attendants revive her).
- **Words:** "They asked his father's name. Duryodhana gave him a kingdom instead, and the stranger gave him his life."

**I.16 · Born from fire.**

- **Shot:** a vertical composition, a sacrificial fire roaring up the panel. From it step a young warrior and a young woman.
- **Carving:** flames shaped like petals.
- **Words:** "King Drupada wanted a son who would kill Droṇa. The fire gave him a son, and a daughter, Draupadī."

**I.17 · The house of lac.**

- **Shot:** night. The palace burns in the centre; in the earth below, cutaway, the five brothers and their mother crawl through a tunnel.
- **Light:** fire above, darkness below.
- **Words:** "A house built to burn. Vidura's warning, a tunnel, and a night run into the forest."

**I.18 · Bhīma carries them.**

- **Shot:** a forest at a tracking angle. Bhīma strides with his mother on his shoulders and his brothers in his arms; the rākṣasī Hiḍimbā watches from a tree.
- **Words:** "The strongest brother carried the whole family through the dark."

**I.19 · The target.**

- **Shot:** looking straight up from below a high spinning target. Arjuna, dressed as a brahmin, is tiny at the bottom, the bow drawn.
- **Carving:** kings who failed lie around the base of the bow.
- **Words:** "A bow no king could string, a target no king could hit. A poor brahmin stood up." (Tradition adds the fish reflected in oil, and versions differ on Karṇa's turn; the site says so where it matters.)

**I.20 · "Share it equally."**

- **Shot:** the doorway of a potter's hut. Kuntī with her back to the door; the brothers and Draupadī frozen at the threshold.
- **Words:** "Without turning around, Kuntī told her sons to share what they had brought. A mother's word could not be taken back."

### ACT II: THE KINGDOM AND THE DICE (Sabhā Parva)

**II.1 · The burning forest.**

- **Shot:** aerial. The Khāṇḍava forest is a ring of fire; Arjuna and Krishna on two chariots hold off the storm of Indra above.
- **Carving:** animals fleeing, Maya the demon-architect spared.
- **Words:** "Fire was promised a forest. Arjuna earned the Gāṇḍīva bow, and a master builder owed him his life."

**II.2 · The hall of illusions.**

- **Shot:** frontal and symmetrical, a vast pillared hall where floors look like water and water looks like floor.
- **Light:** first gold.
- **Words:** "Maya built them a hall where nothing was what it seemed. Indraprastha shone."

**II.3 · The hundredth insult.**

- **Shot:** wide, a royal assembly. Śiśupāla mid-shout; at frame edge, a spinning disc of light leaving Krishna's finger.
- **Words:** "Krishna had promised to forgive a hundred insults. Śiśupāla spoke the hundred and first."

**II.4 · The fall into the water.**

- **Shot:** a Dutch angle. Duryodhana stumbles into a pool he thought was floor; around him, open laughing mouths.
- **Words:** "He fell into the water in front of them. Some laughed. He never forgot." (The famous line "the blind man's son is blind" is a later retelling, not in the Critical Edition; we do not put it in Draupadī's mouth.)

**II.5 · The invitation.**

- **Shot:** close on Śakuni's hand, the dice resting in his open palm; Duryodhana's face reflected in a polished bronze plate behind.
- **Sound:** two dice clicking, very close.
- **Words:** "A game between cousins. What could be gentler?"

**II.6 · The game.**

- **Shot:** top-down on the board. Pieces, dice and heaps of staked treasure stretch across the frame and shrink as the scroll moves.
- **Carving:** the stake changes as you scroll: gold → chariots → kingdom → the brothers → himself.
- **Words:** "He lost his wealth. His kingdom. His brothers. Himself."

**II.7 · Her question.** _(the strongest image of the act)_

- **Shot:** low and frontal. Draupadī, dragged in, stands upright in the middle of the hall with every man seated around her, and asks.
- **Light:** hard overhead white.
- **Carving:** the elders' faces turned away; one young Kaurava, Vikarṇa, standing.
- **Words:** "'Did he lose himself before he staked me? Then whose was I to stake?' No elder answered."

**II.8 · The endless cloth.**

- **Shot:** wide. The cloth pours out of the frame in waves and fills the whole panel, and Duḥśāsana falls back exhausted. Draupadī stays above it with her hands joined.
- **Carving:** waves of fabric (beautiful in relief).
- **Words:** "The more he pulled, the more cloth there was." (In the Critical Edition the garments simply keep appearing; the image of Krishna sending them is tradition. Mark it as told.)

**II.9 · The vows.** _(INTERVAL BANG)_

- **Shot:** push in, three faces.
  - Bhīma, fist on the floor: he will break Duryodhana's thigh and drink Duḥśāsana's blood.
  - Draupadī unbinding her hair.
  - Arjuna's hand on his bow.
- **Sound:** jackals howl outside (an ill omen in the text). Then everything stops.
- **Words:** "She left her hair unbound. It would stay that way until it was washed in his blood."
- **Interval.** The wall goes dark for one full screen, with a single word set small in the centre: "Interval." Sound off.

### ACT III: EXILE (Āraṇyaka and Virāṭa Parvas)

**III.1 · Twelve years.**

- **Shot:** an extreme wide of the forest; six small figures walking into it, the city gate behind.
- **Light:** green shade.
- **Words:** "Twelve years in the forest. A thirteenth in hiding. If they were found, it would begin again."

**III.2 · The hunter.**

- **Shot:** a two-shot in combat. Arjuna fighting a wild hunter over one boar shot by two arrows; behind the hunter, a crescent moon and matted hair (Śiva).
- **Words:** "He fought the hunter for days and lost. The hunter smiled, and gave him the Pāśupata weapon."

**III.3 · Hanumān's tail.**

- **Shot:** a mountain path at Bhīma's eye level. An old monkey's tail lies across the path, and Bhīma cannot lift it.
- **Words:** "Two sons of the wind met on a mountain. The elder taught the younger to bow." (Arjuna's banner rhymes with this.)

**III.4 · The armour and the earrings.**

- **Shot:** a river at dawn, a close-up. Karṇa cuts the golden armour from his own body and holds it out to a brahmin (Indra in disguise).
- **Light:** blood-gold.
- **Words:** "The sun warned him in a dream. He gave it anyway. No one who asked Karṇa for anything was refused."

**III.5 · The lake of questions.**

- **Shot:** a mirror-still lake, top third. Four brothers lie dead on the bank; Yudhiṣṭhira kneels at the water and a crane stands on a stone.
- **Light:** moon.
- **Carving:** questions shown as ripples, not letters.
- **Sound:** silence, insects.
- **Words:** "'What is the greatest wonder?' He answered every question. Asked to choose one brother to live, he chose his stepmother's son."

**III.6 · The year in disguise.**

- **Shot:** a split, five windows in the palace of Virāṭa. A priest-gambler, a cook, a dance teacher (Arjuna as Bṛhannalā), a horse-keeper and a cowherd, with Draupadī as a maid.
- **Words:** "The most famous family in the world became servants, and waited."

**III.7 · Kīcaka.**

- **Shot:** a dark dance hall, a single lamp; a huge shadow on the wall.
- **Words:** "When the general tried to take her, Bhīma waited in the dark of the dance hall in her place."

**III.8 · The weapons in the tree.**

- **Shot:** looking up into a śamī tree where a bundle hangs like a body. A young prince, Uttara, climbs; Arjuna, in a dancer's clothes, below.
- **Words:** "The year ended on the day the Kauravas came for the cattle. A dance teacher asked for a chariot."
- **III.8b · elevation:** Arjuna strings the Gāṇḍīva and the whole Kaurava army sleeps in the next panel (the sammohana weapon); he takes only their upper cloths.

### ACT IV: THE LAST EMBASSY (Udyoga Parva)

**IV.1 · At the head and at the feet.**

- **Shot:** top-down on a sleeping Krishna. Duryodhana sits at his head, Arjuna stands at his feet.
- **Words:** "One asked for his army. The other asked for him, unarmed."

**IV.2 · Five villages.**

- **Shot:** a court in flat noon, symmetrical. Krishna alone in the middle; the throne of Hastināpura and a hundred brothers on the right.
- **Words:** "Give them five villages, and there will be no war. Not even the land under a needle's point, said Duryodhana."

**IV.3 · The form in the court.**

- **Shot:** a court seen from the floor. Krishna's form grows through the ceiling as soldiers sent to bind him fall back.
- **Carving:** the first hint of the Viśvarūpa (it rhymes with our Gītā scene 5, smaller).
- **Words:** "They tried to arrest a messenger. For a moment, the court saw who he was."

**IV.4 · On the chariot.**

- **Shot:** a moving two-shot on a chariot bench. Krishna speaks; Karṇa listens, looking away.
- **Words:** "Krishna told him who his mother was. Karṇa said: then I am the eldest, and I will still fight for my friend."

**IV.5 · Mother and son at the river.**

- **Shot:** a long lens from across the Gaṅgā (the river of I.6). Kuntī stands on the bank as Karṇa finishes his prayer to the sun.
- **Light:** the same dawn as I.6, reversed.
- **Words:** "'You will still have five sons,' he told her. 'With Arjuna, or with me.'"

### ACT V: KURUKṢETRA (Bhīṣma, Droṇa, Karṇa, Śalya, Sauptika Parvas)

**V.0 · The eyes of Sañjaya.**

- **Shot:** a dark palace. Vyāsa touches the eyes of the charioteer Sañjaya; the blind king beside him.
- **Words:** "Sañjaya would see everything, and tell it to a blind king."

**V.1–V.7 · DAY ONE: THE GĪTĀ** ✅ (built; one continuous wall, see HANDOFF)

- ✅ The chariot between the armies.
- ✅ The conches sound.
- ✅ The bow lowers.
- ✅ The teaching begins.
- ✅ The steady lamp (symbolic).
- ✅ The universal form.
- ✅ Clarity.
- (One addition later: **Yudhiṣṭhira walks across the field unarmed** to bow to Bhīṣma and Droṇa before the fighting. It is a beautiful quiet beat.)

**V.8 · Krishna lifts the wheel.** _(elevation)_

- **Shot:** an extreme low angle. Krishna leaps down from the chariot with a chariot wheel raised above his head, charging Bhīṣma; Bhīṣma lowers his bow, welcoming it.
- **Words:** "He had sworn not to fight. Seeing Arjuna hold back, he picked up a wheel. The old man smiled and laid down his bow." (The text has his whip, or the discus; the wheel is tradition, and it rhymes with our motif.)

**V.9 · The bed of arrows.**

- **Shot:** wide and horizontal. Bhīṣma lies in the air on a hundred arrows; Śikhaṇḍin (Ambā reborn, from I.4) stands in front of Arjuna.
- **Light:** sunset.
- **Words:** "He would not fight Śikhaṇḍin. Behind Śikhaṇḍin stood Arjuna. Ambā's oath was kept."

**V.10 · The spring.**

- **Shot:** a close top-down. Arjuna's arrow strikes the earth beside Bhīṣma's head, and water rises.
- **Carving:** the water is the Gaṅgā's (I.1) coming back for her son.
- **Words:** "He asked for water. Arjuna shot an arrow into the ground, and his mother's river rose to meet him."

**V.11 · The wheel formation.**

- **Shot:** aerial over the cakravyūha, spiral rings of soldiers, and one small chariot driving into the centre.
- **Words:** "Abhimanyu, sixteen, knew how to break in. No one had taught him the way out." (Hearing it in his mother's womb is tradition.)

**V.12 · The boy with the wheel.**

- **Shot:** close-up from ground level. Weaponless, Abhimanyu raises a chariot wheel as many warriors close in.
- **Light:** the colour leaves.
- **Sound:** the drone stops.
- **Words:** "When his bow was cut and his sword broken, he picked up a wheel."

**V.13 · Before the sunset.**

- **Shot:** wide. Arjuna's chariot cuts through a whole army toward a sun about to touch the horizon.
- **Carving:** an arrow carrying a severed head across the sky (it lands in a father's lap, far off).
- **Words:** "If Jayadratha lived past sunset, Arjuna would enter the fire."

**V.14 · Night battle.**

- **Shot:** torchlight. Ghaṭotkaca fills the sky, laughing; Karṇa below draws Indra's spear, saved for Arjuna.
- **Words:** "To stop Bhīma's giant son, Karṇa spent the one weapon he had kept for Arjuna."

**V.15 · "Aśvatthāmā is dead."**

- **Shot:** a two-shot. Droṇa listens; Yudhiṣṭhira's lips move, and conches drown the second half of the sentence. Below, a dead elephant.
- **Carving:** Yudhiṣṭhira's chariot wheels, which always hovered above the earth, touch the ground.
- **Words:** "The truest man alive told a half-truth. His chariot came down to earth."

**V.16 · The vow of Act II kept.**

- **Shot:** wide and dark, one form over another (no gore; seen in silhouette against dust). Draupadī's unbound hair in the corner of the frame.
- **Words:** "Bhīma kept his word."

**V.17 · The sinking wheel.**

- **Shot:** a low close-up on the wheel, sunk to the hub in mud, with Karṇa's hands lifting it. Arjuna's bow is drawn in the soft background.
- **Light:** the last gold.
- **Words:** "His wheel sank, and the mantra his teacher had cursed him to forget was gone. He asked for fairness. Krishna asked him where fairness was in the dice hall."

**V.18 · The mace duel.**

- **Shot:** a circle of witnesses on the lake shore. Bhīma and Duryodhana in a wide arc; Balarāma at the edge, furious.
- **Words:** "Below the waist, against the rules. A promise made in the dice hall, kept on the last day."

**V.19 · The night raid.**

- **Shot:** a banyan at night. An owl kills sleeping crows; under it, Aśvatthāmā watches with a sword.
- **Words:** "He saw an owl kill the crows in their sleep, and knew what he would do."

**V.20 · Two weapons in the sky.**

- **Shot:** sky panel. Two blinding lights meet; between them, two sages stand with their arms out.
- **Words:** "Arjuna withdrew his. Aśvatthāmā could not, and turned it toward an unborn child. Krishna saved the child, Parikṣit, the last of the line."

### ACT VI: ASH (Strī, Śānti, Anuśāsana, Āśvamedhika Parvas)

**VI.1 · The women on the field.**

- **Shot:** an extreme wide in grey dawn. Thousands of small figures of women walk among the fallen.
- **Sound:** wind, no drone.
- **Words:** "The war took eighteen days. The grief would not end."

**VI.2 · The iron statue.**

- **Shot:** a close-up. Dhṛtarāṣṭra's embrace crushes an iron statue of Bhīma to dust; Krishna had switched them.
- **Words:** "The blind king asked to embrace Bhīma."

**VI.3 · Gāndhārī's curse.**

- **Shot:** frontal and still; Gāndhārī's blindfold lifted a sliver, and Krishna bowing before her.
- **Words:** "'You could have stopped it.' She cursed his clan to destroy itself. He accepted."

**VI.4 · "He was your brother."**

- **Shot:** water rites at the river. Kuntī speaks; Yudhiṣṭhira turns to an empty place among the brothers.
- **Words:** "At the river, Kuntī asked them to offer water for Karṇa too."

**VI.5 · The teacher on the arrows.**

- **Shot:** a ring of Pāṇḍavas around the arrow-bed of V.9, now from above with new grass around it.
- **Light:** winter sun turning north.
- **Words:** "For fifty-eight nights he taught the new king, then chose his moment, and left."

**VI.6 · The night the dead returned.**

- **Shot:** an extreme wide of the Gaṅgā at night. Out of the river, the fallen of both armies rise, shining and reconciled; families on the bank.
- **Light:** moon on water.
- **Words:** "Years later, Vyāsa called them out of the river for a single night. No one fought." (Āśramavāsika Parva.)

### ACT VII: RETURN (Mausala, Mahāprasthānika, Svargārohaṇa Parvas)

**VII.1 · The hunter's arrow.**

- **Shot:** a quiet forest; Krishna lying under a tree, one foot visible, and a hunter's arrow in flight.
- **Light:** soft, no shadows.
- **Sound:** a single flute-like tone (synthesised), then nothing.
- **Words:** "Thirty-six years later, Gāndhārī's curse came true: the clan fought itself to nothing. Then a hunter named Jarā saw what he thought was a deer."

**VII.2 · Dvārakā under the sea.**

- **Shot:** wide. The ocean rises over a golden city; Arjuna leads the survivors away, his bow suddenly heavy.
- **Words:** "Arjuna came too late. The Gāṇḍīva had grown heavy in his hands, and behind them the sea took the city."

**VII.3 · The last walk.**

- **Shot:** an extreme wide of the Himalaya. Six figures and a dog climb a white slope; one by one, small shapes stay behind in the snow as the scroll continues.
- **Words:** "Draupadī fell first. Then the twins, Arjuna, Bhīma. Yudhiṣṭhira did not look back. Only the dog kept up."

**VII.4 · The dog.** _(final elevation)_

- **Shot:** low. Indra's chariot of light at the summit; Yudhiṣṭhira stands between it and the dog.
- **Words:** "'Not without him.' The dog was Dharma, his father, testing him one last time."

**VII.5 · Heaven, hell, and the choice.**

- **Shot:** split frame, light above and darkness below. Duryodhana is enthroned in light; his brothers' voices come from the dark.
- **Words:** "He chose to stay where his brothers were. The darkness was an illusion, the last one."

**EPILOGUE · Back to plaster.**

- **Shot:** the cave of P1, pulling out further and further until the cave is a tiny carved shape on a blank wall.
- **Sound:** the drone thins to silence.
- **Words:** "The scribe set down his tusk. The wall is quiet again. Move, and it remembers."

---

## 4. How this becomes the website

**Structure.** The reference's strength is one continuous wall, and our wall engine already handles many panels (lazy load and release). Recommendation:

- `/`: **Prologue + Act I** as one continuous wall, the new opening ("MAHĀBHĀRATA").
- `/act-2`, `/act-3`, … `/act-7`: each act is its own continuous wall. The bottom of each act glides into the next (the next act's first panel is already carved at the foot of the page, and the route changes as you scroll in). Each page stays light enough for phones, and the menu becomes the map of the epic.
- The current Gītā page becomes **Act V, Day One**, kept as built.
- Interval: a full dark screen at the end of Act II, with sound off, like a cinema.

**One scene, one build step** (repeat for each panel):

1. Write the scene's ChatGPT prompt from this treatment, attaching the previous panel and the studio still, so cast, costume and plaster stay consistent.
2. Inspect the render: no text, no lettering, and the camera differs from the last panel.
3. `sh scripts/relief/make_scene.sh <id> docs/references/<file>.png`.
4. Add the `[data-scene]` section with its words, then run the tests, check the preview, commit and push.

**Build order.**

1. Prologue P1–P3: they set the frame and the new title.
2. Act I in order.
3. Acts II–VII.
4. Then sound per act, routes and the menu map.

**Copy note.** Every "Words" line above is original draft copy. The quoted questions (Draupadī's, the Yakṣa's) are paraphrases, not verses. Before launch they get a pass against the Critical Edition and a reusable translation for any real quotation.
