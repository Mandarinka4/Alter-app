# Alter - note

**What I built**
Alter lets you pick one of five ready-made characters or create your own, chat with them in real time, and come back later to find everything where you left it. Characters remember what you've told them, and the brain icon at the top of the chat shows exactly what they remember, with an option to wipe it.

**Main choices**
1.	Stack: Next.js on Vercel, Postgres on Neon, GPT-OSS 120B on Groq, all on free tiers. I picked Groq mainly for speed, since in a chat how fast the first words appear matters a lot. 
2.	Personality: instead of a free-text prompt, you choose traits and a tone, and each one maps to concrete rules. For example, "Curious" means following up on details, but asking at most one question per message. Characters stay more consistent this way, and setting one up on a phone is quick. They also reply in whatever language you write in.
3.	Look: the five ready-made characters are illustrations I generated with Gemini from one shared style prompt, so they feel like one cast. For your own character, you can pick a generated drawing or upload a picture.
4.	Memory: the last 20 messages go to the model as they are, and every six messages a smaller model updates a short memory card (facts about you plus a summary of the conversation) in the background. That keeps the prompt roughly the same size however long the chat gets.
5.	No accounts: an anonymous cookie, so you can start chatting straight away. The catch is that your chats stay on one device.

**What I cut:** login and sync across devices, editing and deleting characters, and moderation of uploaded pictures.

**Time:** about 2.5-3 hours.

**With another week:** passwordless login via email (magic link) that keeps your existing chats; smarter memory (search over older messages, and characters who bring things up on their own, like "How did the interview go?"); a small set of scripted conversations to check that each character stays in voice; and simple tracking of how many people come back after a day or a week.
