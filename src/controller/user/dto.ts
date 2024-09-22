import { IsEnum, IsMobilePhone, IsNumber } from "class-validator";

export class WithdrawalRequestDto {
  @IsNumber()
  id!: number;

  @IsEnum(["approved", "rejected"], {
    message(validationArguments) {
      return `status must be one of ${validationArguments.constraints}`;
    },
  })
  status!: "approved" | "rejected";
}
