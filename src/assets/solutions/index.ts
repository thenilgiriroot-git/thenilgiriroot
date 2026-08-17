// Centralized imports for Solutions assets — original JPG fallback + WebP responsive variants.
import { blurDataURIs } from "./blur-data";

import distributors from "./distributors.jpg";
import retailers from "./retailers.jpg";
import restaurants from "./restaurants.jpg";
import foodservice from "./foodservice.jpg";
import bulk from "./bulk.jpg";
import exportImg from "./export.jpg";

import dist480 from "./optimized/distributors-480.webp";
import dist768 from "./optimized/distributors-768.webp";
import dist1024 from "./optimized/distributors-1024.webp";
import dist1440 from "./optimized/distributors-1440.webp";

import ret480 from "./optimized/retailers-480.webp";
import ret768 from "./optimized/retailers-768.webp";
import ret1024 from "./optimized/retailers-1024.webp";
import ret1440 from "./optimized/retailers-1440.webp";

import rest480 from "./optimized/restaurants-480.webp";
import rest768 from "./optimized/restaurants-768.webp";
import rest1024 from "./optimized/restaurants-1024.webp";
import rest1440 from "./optimized/restaurants-1440.webp";

import fs480 from "./optimized/foodservice-480.webp";
import fs768 from "./optimized/foodservice-768.webp";
import fs1024 from "./optimized/foodservice-1024.webp";
import fs1440 from "./optimized/foodservice-1440.webp";

import bulk480 from "./optimized/bulk-480.webp";
import bulk768 from "./optimized/bulk-768.webp";
import bulk1024 from "./optimized/bulk-1024.webp";
import bulk1440 from "./optimized/bulk-1440.webp";

import exp480 from "./optimized/export-480.webp";
import exp768 from "./optimized/export-768.webp";
import exp1024 from "./optimized/export-1024.webp";
import exp1440 from "./optimized/export-1440.webp";

export interface SolutionImage {
  src: string;
  webp: Record<number, string>;
  blur: string;
}

export const solutionImages: Record<string, SolutionImage> = {
  distributors: {
    src: distributors,
    webp: { 480: dist480, 768: dist768, 1024: dist1024, 1440: dist1440 },
    blur: blurDataURIs.distributors,
  },
  retailers: {
    src: retailers,
    webp: { 480: ret480, 768: ret768, 1024: ret1024, 1440: ret1440 },
    blur: blurDataURIs.retailers,
  },
  restaurants: {
    src: restaurants,
    webp: { 480: rest480, 768: rest768, 1024: rest1024, 1440: rest1440 },
    blur: blurDataURIs.restaurants,
  },
  foodservice: {
    src: foodservice,
    webp: { 480: fs480, 768: fs768, 1024: fs1024, 1440: fs1440 },
    blur: blurDataURIs.foodservice,
  },
  bulk: {
    src: bulk,
    webp: { 480: bulk480, 768: bulk768, 1024: bulk1024, 1440: bulk1440 },
    blur: blurDataURIs.bulk,
  },
  export: {
    src: exportImg,
    webp: { 480: exp480, 768: exp768, 1024: exp1024, 1440: exp1440 },
    blur: blurDataURIs["export"],
  },
};
