import { test, expect, Page, Locator } from '@playwright/test';

test('has title', async ({ page }) => {
  const clusterPage = new ClusterPage(page);
  await clusterPage.goto();
  expect(await clusterPage.title).toBe('Chicago Traffic Accidents Clustering');
});

test('it prints current parameters', async ({ page }) => {
  const clusterPage = new ClusterPage(page);
  await clusterPage.goto({
    size: 1000,
    distance: 450,
    minClusterSize: 5,
  });
  await expect(clusterPage.size).toHaveText('1000');
  await expect(clusterPage.distance).toHaveText('450');
  await expect(clusterPage.minClusterSize).toHaveText('5');
});

test('it should print validation error when out of bound parameters are passed', async ({
  page,
}) => {
  const clusterPage = new ClusterPage(page);
  await clusterPage.goto();
  await clusterPage.setDistance(1);
  await clusterPage.submit();
  await expect(clusterPage.distanceError).toHaveText(
    'Distance must be at least 100'
  );
});

class ClusterPage {
  constructor(readonly page: Page) {}

  async goto({
    size,
    distance,
    minClusterSize,
  }: {
    size?: number;
    distance?: number;
    minClusterSize?: number;
  } = {}) {
    const url = new URL('http://localhost:5173/clustering');
    if (size) url.searchParams.set('size', String(size));
    if (distance) url.searchParams.set('distance', String(distance));
    if (minClusterSize)
      url.searchParams.set('minClusterSize', String(minClusterSize));
    await this.page.goto(url.toString());
  }

  get title() {
    return this.page.title();
  }

  get size() {
    return this.page.locator('span.size');
  }

  get distance() {
    return this.page.locator('span.distance');
  }

  get minClusterSize() {
    return this.page.locator('span.min-cluster-size');
  }

  async setDistance(distance: number) {
    await this.page.fill('input[name="distance"]', String(distance));
  }
  get distanceError() {
    return this.page.locator('.error.distance');
  }
  async submit() {
    return this.page.click('button[type="submit"]');
  }
}
