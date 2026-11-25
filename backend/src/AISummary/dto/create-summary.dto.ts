import {IsUUID} from "class-validator"

export class CreateSummaryDto {
    @IsUUID()
    readonly skillId!: string
}