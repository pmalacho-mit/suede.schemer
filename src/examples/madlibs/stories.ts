/**
 * The stories, as templates. A blank is written `{kind}`, where `kind` is a
 * part of speech from `words.ts`; `{kind:name}` names it, and every blank with
 * that name is the same word, asked for once. A blank line starts a new
 * paragraph.
 */
export type Story = {
  /** the discriminator: the `story` the form's data carries */
  id: string;
  title: string;
  /** a line under the title, on the story's card */
  blurb: string;
  template: string;
};

export const stories = [
  {
    id: "dragon",
    title: "The Dragon's Dentist",
    blurb: "A check-up with four hundred years of plaque.",
    template: `In thirty years of dentistry, Dr. {celebrity:dentist} had polished {number} sets of teeth, but never a dragon's.

The dragon, a {adjective} old beast called Gerald, opened his jaws and said, "Be {adverb} gentle. The last dentist used a {noun}, and I {verbPast} him."

Inside were three rows of fangs, each the size of a {noun}, and a half-eaten {food} wedged between the molars. "{exclamation}" cried Dr. {celebrity:dentist}, reaching for the {colour} floss.

After an hour of {verbIng}, Gerald smiled for the first time in four centuries, and all of {place} glittered in the sparkle. He paid the bill in {pluralNoun} and left with a lollipop the size of a {animal}. Dr. {celebrity:dentist} has since put up a sign: "Dragons by appointment only. Please bring your own {noun}."`,
  },
  {
    id: "station",
    title: "Space Station Log",
    blurb: "Day something of something. Morale: unclear.",
    template: `Day {number:day} aboard the space station. The {adjective} smell from the galley is back; somebody microwaved {food} again.

Commander {celebrity} insists we keep {verbIng} until morale improves. Morale has not improved. At breakfast a {animal} floated past the window, waving its {bodyPart} at us {adverb}. Nobody knows how it got up here.

Mission Control says to stay calm and stop pressing the {colour} button. I have pressed it {number:presses} times. Every time, it goes "{noise}".

If anyone finds this log, tell my {pluralNoun} I love them, and tell {place} I am sorry about the {noun}. It is still day {number:day}. {exclamation}`,
  },
  {
    id: "casserole",
    title: "Grandma's Casserole",
    blurb: "A family recipe, handed down and then quickly handed back.",
    template: `Grandma's famous {adjective:dish} casserole. Serves {number:serves}, or one very hungry {animal}.

First, preheat the oven to {number:degrees} degrees and ask it {adverb} how its day was. In your biggest {noun}, combine two cups of {pluralNoun} with a generous pinch of {food}. Stir with your {bodyPart} until the mixture starts {verbIng}. If it starts {verbIng} on its own, call a grown-up.

Pour everything into a {colour} dish and bake until golden, {adjective:dish} and only slightly on fire, or until the neighbours have {verbPast}.

Garnish with a single {noun}. Grandma swore the secret ingredient was {liquid}, but she said the same about {celebrity}. Serve at once, shouting "{exclamation}" before anybody can ask what is in it.`,
  },
  {
    id: "horoscope",
    title: "Your Horoscope",
    blurb: "The stars have opinions. Most of them are about you.",
    template: `The stars are {adjective:stars} this week, and Mercury is {verbIng} backwards, so brace yourself.

On Monday a stranger holding a {noun} will offer you {number} {pluralNoun}. Accept them {adverb}. Avoid {place} on Wednesday, and under no circumstances let a {animal} read your diary.

Your lucky colour is {colour}. Your lucky food is {food}. Your lucky body part is your left {bodyPart}, so keep it {adjective} at all times.

Romance arrives when you least expect it, most likely with {celebrity}, possibly while {verbIng}. By Sunday you will have {verbPast} at least once. {exclamation} Next week the stars are still {adjective:stars}, and frankly, so are you.`,
  },
] as const satisfies readonly Story[];

export type StoryId = (typeof stories)[number]["id"];
