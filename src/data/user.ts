export class Gender {
    gender: string
    genderText: string

    constructor(gender: string,
        genderText: string) {
        this.gender = gender
        this.genderText = genderText
    }

    toString(): string {
        return `${this.gender} ${this.genderText}`;
    }
}

export class Interaction {
    count: string
    shows: string

    constructor(count: string,
        shows: string) {
        this.count = count
        this.shows = shows
    }

    toString(): string {
        return `${this.count} ${this.shows}`;
    }
}

export class UserInfo {
    redId: string
    nickname: string
    avatar: string
    location: string
    description: string
    tags: (string | Gender)[]
    interactions: Interaction[]
    following: boolean = false
    createTime?: Date
    updateTime?: Date

    constructor(
        nickname: string,
        redId: string,
        avatar: string,
        location: string,
        description: string,
        tags: (string | Gender)[],
        interactions: Interaction[],
        following: boolean,
        createTime: Date = new Date(),
        updateTime: Date = new Date()
    ) {
        this.nickname = nickname;
        this.redId = redId;
        this.avatar = avatar;
        this.location = location;
        this.description = description;
        this.tags = tags;
        this.interactions = interactions;
        this.following = following
        this.createTime = createTime
        this.updateTime = updateTime
    }
}
