import { IHttp } from "@rocket.chat/apps-engine/definition/accessors";
import { API_BASE_URI } from "../constants";

export async function requestServer(
    http: IHttp,
    endpoint: `/${string}`,
    data: Record<string, string>
): Promise<null | string | string[] | Record<string, string | number>> {
    const uri = `${API_BASE_URI}${endpoint}`;
    const res = await http.post(uri, { data: data });

    if (!res || res.statusCode !== 200) {
        return null;
    }

    console.log(uri);
    console.log(data);
    console.log(res.data);

    console.log(
        "======================================================================================================="
    );

    return res.data;
}
