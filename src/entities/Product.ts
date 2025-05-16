import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  BeforeInsert,
} from "typeorm";
import {
  MinLength,
  IsNotEmpty,
  IsNumber,
  Min,
  IsDefined,
} from "class-validator";

@Entity("product")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  @MinLength(2, { message: "Product name must be at least 2 characters long" })
  @IsNotEmpty({ message: "Product name is required" })
  title: string;

  @Column({ nullable: false })
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @Column("decimal", { nullable: false })
  @IsNumber()
  @Min(0)
  price: number;

  @Column({ nullable: false })
  @MinLength(2, { message: "Category must be at least 2 characters long" })
  @IsNotEmpty({ message: "Category is required" })
  category: string;

  @Column()
  @IsNotEmpty({ message: "Image is required" })
  image: string;

  @Column({ default: 0 })
  @IsNotEmpty({ message: "Stock quantity is required" })
  @IsNumber()
  @Min(0)
  stock: number;

  @Column({ default: 0 })
  @IsNumber()
  @Min(0)
  reserved: number;

  @Column({ default: 0 })
  @IsDefined()
  @IsNumber()
  @Min(0)
  available: number;

  @BeforeInsert()
  @BeforeUpdate()
  updateAvailableQuantity() {
    this.available = Math.max(0, this.stock - this.reserved);
  }
}
