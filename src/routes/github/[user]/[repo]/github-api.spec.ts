import { describe, it, vi, beforeEach, Mock } from 'vitest';
import { Fetch, GithubApi } from './github-api';
import { delay } from '.';

describe('github-api', () => {
  let fetchMock: Mock<Parameters<Fetch>, ReturnType<Fetch>>;
  let delayMock: Mock<[ms: number], Promise<void>>;
  let api: GithubApi;

  beforeEach(() => {
    fetchMock = vi.fn<Parameters<Fetch>, ReturnType<Fetch>>(mockPromise);
    delayMock = vi.fn<[number], Promise<void>>(mockPromise);
    api = new GithubApi('TOKEN', fetchMock, delayMock);
  });

  describe('getRepository', () => {
    it('should return repository information', async ({ expect }) => {
      const responsePromise = api.getRepository('USERNAME', 'REPOSITORY');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/repos/USERNAME/REPOSITORY',
        {
          headers: {
            'User-Agent': 'Qwik Workshop',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: 'Bearer TOKEN',
          },
        }
      );
      fetchMock.mock.results[0].value.resolve(new Response('"RESPONSE"'));
      expect(await responsePromise).toEqual('RESPONSE');
    });
    it('should timeout after x seconds with time out response', async ({
      expect,
    }) => {
      const responsePromise = api.getRepository('USERNAME', 'REPOSITORY');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/repos/USERNAME/REPOSITORY',
        {
          headers: {
            'User-Agent': 'Qwik Workshop',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: 'Bearer TOKEN',
          },
        }
      );
      expect(delayMock).toHaveBeenCalledWith(4000);
      delayMock.mock.results[0].value.resolve();
      expect(await responsePromise).toEqual({ response: 'timeout' });
    });
    it('should handle error response', async ({ expect }) => {
      const responsePromise = api.getRepository('USERNAME', 'REPOSITORY');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/repos/USERNAME/REPOSITORY',
        {
          headers: {
            'User-Agent': 'Qwik Workshop',
            'X-GitHub-Api-Version': '2022-11-28',
            Authorization: 'Bearer TOKEN',
          },
        }
      );
      fetchMock.mock.results[0].value.resolve(
        new Response(null, { status: 404 })
      );
      expect(await responsePromise).toEqual({ response: 'error' });
    });
  });

  describe('getRepositories', () => {
    it('should fetch all repositories for a user', async ({ expect }) => {
      const responsePromise = api.getRepositories('USERNAME');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/users/USERNAME/repos?per_page=30&page=1',
        expect.any(Object)
      );
      const repoSet1 = new Array(30).fill(null).map((_, i) => ({ id: i }));
      fetchMock.mock.results[0].value.resolve(
        new Response(JSON.stringify(repoSet1))
      );
      await delay(0);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.github.com/users/USERNAME/repos?per_page=30&page=2',
        expect.any(Object)
      );
      const repoSet2 = [{ id: 31 }];
      fetchMock.mock.results[1].value.resolve(
        new Response(JSON.stringify(repoSet2))
      );
      expect(await responsePromise).toEqual([...repoSet1, ...repoSet2]);
    });
  });
});

function mockPromise<T>(): Promise<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  }) as Promise<T> & {
    resolve: (value: T) => void;
    reject: (reason: any) => void;
  };
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}
