import bycrypt from "bcrypt"

export async function CriarHash(senha, salts) {
    const hash = await bycrypt.hash(senha, salts);
    console.log(hash);
    return hash
}

export async function CompararHash(senhaDigitada, senhaHash) {
  try {
    const match = await bycrypt.compare(senhaDigitada, senhaHash);
    return match; // true se for igual, false se não for
  } catch (error) {
    console.error("Erro ao comparar hash:", error);
    return false;
  }
}
