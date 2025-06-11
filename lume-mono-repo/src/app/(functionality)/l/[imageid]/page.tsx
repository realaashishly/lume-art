import React from "react";

type Props = {
    params: {
        imageid: string;
    };
};

export default async function Page({ params }: Props) {
    const { imageid } = await params;

    return <div>Work no proccess for this image {imageid}</div>;
}
