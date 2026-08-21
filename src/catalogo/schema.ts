import { z } from "zod";
import { CATEGORIAS } from "./tipos.ts";

export const ComponenteSchema = z
  .object({
    nome: z.string().trim().min(1, "nome não pode ficar vazio"),
    quantidade: z.number().int().positive().optional(),
  })
  .strict();

export const VarianteSchema = z
  .object({
    descricao: z.string().trim().min(1, "descrição não pode ficar vazia"),
    preco: z.number().positive("preço deve ser maior que zero"),
    componentes: z.array(ComponenteSchema).min(1).optional(),
  })
  .strict();

export const ProdutoMetaSchema = z
  .object({
    nome: z.string().trim().min(1, "nome não pode ficar vazio"),
    descricao: z.string().trim().min(1).optional(),
    preco: z.number().positive("preço deve ser maior que zero").optional(),
    componentes: z.array(ComponenteSchema).min(1).optional(),
    variantes: z.array(VarianteSchema).min(2).optional(),
    medidas: z.string().trim().min(1).optional(),
    sobMedida: z.boolean().optional(),
    corPersonalizavel: z.boolean().optional(),
  })
  .strict()
  .superRefine((produto, contexto) => {
    const temPreco = produto.preco !== undefined;
    const temVariantes = produto.variantes !== undefined;

    if (temPreco === temVariantes) {
      contexto.addIssue({
        code: "custom",
        message: "informe exatamente um entre 'preco' e 'variantes'",
      });
    }

    if (temVariantes && produto.componentes) {
      contexto.addIssue({
        code: "custom",
        path: ["componentes"],
        message:
          "componentes de um produto com variantes pertencem a cada variante",
      });
    }
  });

const CategoriaSchema = z.enum(CATEGORIAS);

export const CatalogoSchema = z.record(
  CategoriaSchema,
  z.record(z.string().min(1), ProdutoMetaSchema),
);

export type ProdutoMeta = z.infer<typeof ProdutoMetaSchema>;
export type CatalogoMeta = z.infer<typeof CatalogoSchema>;

export function validarCatalogo(valor: unknown): CatalogoMeta {
  const resultado = CatalogoSchema.safeParse(valor);
  if (resultado.success) return resultado.data;

  const detalhes = resultado.error.issues.map((erro) => {
    const [categoria = "raiz", slug = "-", ...campo] = erro.path;
    const local = campo.length > 0 ? campo.join(".") : "produto";
    return `  • [${categoria}/${slug}] ${local}: ${erro.message}`;
  });

  throw new Error(`\nCatálogo inválido:\n${detalhes.join("\n")}\n`);
}
