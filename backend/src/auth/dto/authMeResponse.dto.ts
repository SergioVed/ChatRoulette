

export class AuthMeResponse {
    public userId!: string
    public onBoardingCompleted!: boolean
    public name!: string

    constructor(userId: string, onBoardingCompleted: boolean, name: string) {
        this.name = name
        this.userId = userId
        this.onBoardingCompleted = onBoardingCompleted
    }
}