import { v4 as uuid } from "uuid";

export const aspectOptions = [
    { id: uuid(), value: "1:1", label: "1:1 (Square)" },
    { id: uuid(), value: "3:2", label: "3:2 (Landscape)" },
    { id: uuid(), value: "2:3", label: "2:3 (Portrait)" },
    { id: uuid(), value: "4:3", label: "4:3 (Standard)" },
    { id: uuid(), value: "3:4", label: "3:4 (Portrait)" },
    { id: uuid(), value: "16:9", label: "16:9 (Widescreen)" },
    { id: uuid(), value: "9:16", label: "9:16 (Mobile Portrait)" },
    { id: uuid(), value: "21:9", label: "21:9 (Ultra-Wide)" },
    { id: uuid(), value: "9:21", label: "9:21 (Tall Ultra-Wide)" },
    { id: uuid(), value: "5:4", label: "5:4" },
    { id: uuid(), value: "4:5", label: "4:5" },
    { id: uuid(), value: "7:5", label: "7:5" },
    { id: uuid(), value: "5:7", label: "5:7" },
    { id: uuid(), value: "2:1", label: "2:1 (Banner)" },
    { id: uuid(), value: "1:2", label: "1:2" },
];

export const styleOptions = [
    { id: uuid(), value: "default", label: "Default" },
    { id: uuid(), value: "realistic", label: "Realistic" },
    { id: uuid(), value: "cartoon", label: "Cartoon" },
    { id: uuid(), value: "abstract", label: "Abstract" },
    { id: uuid(), value: "painting", label: "Painting" },
    { id: uuid(), value: "sketch", label: "Sketch" },
];

export const imageCount = [
    { id: uuid(), value: "1", label: "1 image" },
    { id: uuid(), value: "2", label: "2 images" },
    { id: uuid(), value: "4", label: "4 images" },
];
