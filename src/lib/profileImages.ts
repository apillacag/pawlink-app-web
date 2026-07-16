const maleImages = [
  "/images/profiles/profile-m-01.jpg",
  "/images/profiles/profile-m-02.jpg",
  "/images/profiles/profile-m-03.jpg",
  "/images/profiles/profile-m-04.jpg",
  "/images/profiles/profile-m-05.jpg",
  "/images/profiles/profile-m-06.jpg",
  "/images/profiles/profile-m-07.jpg",
  "/images/profiles/profile-m-08.jpg",
]

const femaleImages = [
  "/images/profiles/profile-f-01.jpg",
  "/images/profiles/profile-f-02.jpg",
  "/images/profiles/profile-f-03.jpg",
  "/images/profiles/profile-f-04.jpg",
  "/images/profiles/profile-f-05.jpg",
  "/images/profiles/profile-f-06.jpg",
  "/images/profiles/profile-f-07.jpg",
  "/images/profiles/profile-f-08.jpg",
]

const maleFirstNames = new Set([
  "james", "john", "robert", "michael", "william", "david", "richard", "joseph",
  "thomas", "charles", "christopher", "daniel", "matthew", "anthony", "mark",
  "donald", "steven", "paul", "andrew", "joshua", "kenneth", "kevin", "brian",
  "george", "timothy", "ronald", "edward", "jason", "jeffrey", "ryan", "jacob",
  "gary", "nicholas", "eric", "jonathan", "stephen", "larry", "justin", "scott",
  "brandon", "benjamin", "samuel", "raymond", "gregory", "frank", "alexander",
  "patrick", "jack", "dennis", "jerry", "tyler", "aaron", "jose", "henry",
  "adam", "douglas", "nathan", "peter", "zachary", "kyle", "walter", "harold",
  "carl", "jeremy", "keith", "roger", "gerald", "ethan", "arthur", "lawrence",
  "terry", "sean", "austin", "carlos", "bryan", "juan", "bruce", "bobby",
  "jordan", "roy", "johnny", "randy", "jimmy", "joe", "albert", "willie",
  "dylan", "alan", "jorge", "luis", "vincent", "billy", "bradley", "philip",
  "fred", "bob", "martin", "craig", "dan", "dave", "max", "leo", "oliver",
  "jackson", "aiden", "lucas", "mason", "logan", "jaxon", "liam", "ezra",
  "silas", "hugo", "oscar", "felix", "victor", "sam", "julian", "miles",
  "harrison", "wesley", "cole", "damien", "santiago", "mateo", "sebastian",
  "diego", "alejandro", "emiliano", "nicolas", "francisco", "javier", "cristian",
  "eduardo", "fernando", "manuel", "pedro", "ricardo", "miguel", "angel",
  "pablo", "marco", "antonio", "enrique", "arturo", "rafael", "ismael",
  "wilson", "washington", "alfredo", "jesus", "carlos",
])

const femaleFirstNames = new Set([
  "mary", "patricia", "jennifer", "linda", "barbara", "elizabeth", "susan",
  "jessica", "sarah", "karen", "lisa", "nancy", "betty", "margaret", "sandra",
  "ashley", "dorothy", "kimberly", "emily", "donna", "michelle", "carol",
  "amanda", "melissa", "deborah", "stephanie", "rebecca", "sharon", "laura",
  "cynthia", "kathleen", "amy", "angela", "shirley", "anna", "brenda",
  "pamela", "emma", "nicole", "helen", "samantha", "katherine", "christine",
  "debra", "rachel", "carolyn", "janet", "catherine", "maria", "heather",
  "diane", "ruth", "julia", "virginia", "alice", "jean", "denise", "megan",
  "andrea", "teresa", "ann", "doris", "elaine", "gloria", "evelyn", "joan",
  "cheryl", "kathy", "madison", "charlotte", "sophia", "amelia", "isabella",
  "mia", "harper", "ava", "ella", "grace", "chloe", "victoria", "riley",
  "aaliyah", "layla", "zoey", "nora", "hannah", "leah", "lily", "stella",
  "hazel", "ellie", "aurora", "penelope", "luna", "savannah", "skylar",
  "paisley", "naomi", "gianna", "kylie", "mackenzie", "aubrey", "faith",
  "valentina", "camila", "luciana", "isabel", "gabriela", "sofia", "martina",
  "ximena", "daniela", "fernanda", "alejandra", "mariana", "carmen", "ana",
  "paula", "laura", "elena", "carla", "rosa", "gabrielle", "annie",
])

function getGender(name: string): "male" | "female" {
  const first = name.trim().split(/\s+/)[0]?.toLowerCase() || ""
  if (maleFirstNames.has(first)) return "male"
  if (femaleFirstNames.has(first)) return "female"
  return first.endsWith("a") ? "female" : "male"
}

function hashId(id: string, offset: number = 0): number {
  let hash = offset
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

export function getProfileImage(avatarUrl: string | null | undefined, userId: string, name: string, role: "WALKER" | "SPECIALIST" = "WALKER"): string {
  if (avatarUrl) return avatarUrl
  const gender = getGender(name)
  const pool = gender === "male" ? maleImages : femaleImages
  const roleOffset = role === "SPECIALIST" ? 100 : 0
  const index = hashId(userId, roleOffset) % pool.length
  return pool[index]
}

export function getProfileImageSrc(userId: string, avatarUrl: string | null | undefined): string {
  return avatarUrl || "/images/default-avatar.jpg"
}

export function getWalkerProfileImage(userId: string, name: string, avatarUrl: string | null | undefined): string {
  return getProfileImage(avatarUrl, userId, name, "WALKER")
}

export function getSpecialistProfileImage(userId: string, name: string, avatarUrl: string | null | undefined): string {
  return getProfileImage(avatarUrl, userId, name, "SPECIALIST")
}