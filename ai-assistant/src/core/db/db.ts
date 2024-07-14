import { IEmbeddingModel } from "../embeddings/embeddings.types";

export type DBNodeRelation = "CONTAINS" | "USES";

export class DBNode {
    id: string;
    name: string;
    type: string;

    code: string;

    filePath: string;
    relations: { target: string; relation: DBNodeRelation }[];

    nameEmbeddings: number[];
    codeEmbeddings: number[];

    isFile: boolean;
    descriptor: "Node" | string;

    constructor(node: {
        id: string;
        name: string;
        type: string;
        code: string;
        filePath: string;
        relations: { target: string; relation: DBNodeRelation }[];
        nameEmbeddings: number[];
        codeEmbeddings: number[];
        descriptor: "Node" | string;

        isFile?: boolean;
    }) {
        this.id = node.id;
        this.name = node.name;
        this.type = node.type;

        this.code = node.code;

        this.filePath = node.filePath;
        this.relations = node.relations;

        this.nameEmbeddings = node.nameEmbeddings;
        this.codeEmbeddings = node.codeEmbeddings;

        this.isFile = node.isFile || false;
        this.descriptor = node.descriptor;
    }

    static async fillEmbeddings(
        embeddingModel: IEmbeddingModel,
        node: DBNode
    ): Promise<DBNode> {
        node.nameEmbeddings = (await embeddingModel.generate(node.name)) ?? [];
        node.codeEmbeddings = (await embeddingModel.generate(node.code)) ?? [];

        return node;
    }

    getDBInsertQuery(): string {
        let query = "";
        query += `
         CREATE (n:${this.descriptor} {
            id: $id,
            name: $name,
            type: $type,

            code: $code,
            filePath: $filePath,

            nameEmbeddings: $nameEmbeddings,
            codeEmbeddings: $codeEmbeddings
         })
      `;

        return query;
    }
}
