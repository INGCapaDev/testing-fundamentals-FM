import { describe, it } from 'vitest';
import { cluster, loadDataset } from './clustering';

const DATASET = [
  {
    lng: -87.618204447,
    lat: 41.828255193,
  },
  {
    lng: -87.556348459,
    lat: 41.749729612,
  },
  {
    lng: -87.618419977,
    lat: 41.861995495,
  },
  {
    lng: -87.624511477,
    lat: 41.884366908,
  },
];

describe('clustering', () => {
  it('should load data', ({ expect }) => {
    const dataset = loadDataset();
    expect(dataset.length).toBeGreaterThan(0);
  });

  it('should create a cluster', ({ expect }) => {
    const dataset = DATASET;
    const clusters = cluster(dataset, 5, 1);
    expect(clusters).toMatchObject({
      clusters: [
        {
          data: [
            {
              lat: 41.828255193,
              lng: -87.618204447,
            },
            {
              lat: 41.749729612,
              lng: -87.556348459,
            },
            {
              lat: 41.861995495,
              lng: -87.618419977,
            },
            {
              lat: 41.884366908,
              lng: -87.624511477,
            },
          ],
          latMax: 41.884366908,
          latMin: 41.749729612,
          lngMax: -87.556348459,
          lngMin: -87.624511477,
        },
      ],
      latMax: 41.884366908,
      latMin: 41.749729612,
      lngMax: -87.556348459,
      lngMin: -87.624511477,
    });
  });
});
