import type { paths } from '@octokit/openapi-types';

type OrgRepoResponse =
  paths['/repos/{owner}/{repo}']['get']['responses']['200']['content']['application/json'];

export type Fetch = typeof fetch;

export class GithubApi {
  constructor(
    private token: string | undefined,
    private fetch: Fetch,
    private delay: (ms: number) => Promise<void>
  ) {}

  async getRepository(user: string, repo: string) {
    const headers: HeadersInit = {
      'User-Agent': 'Qwik Workshop',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    if (this.token) {
      headers['Authorization'] = 'Bearer ' + this.token;
    }

    return Promise.race([
      this.delay(4000).then(() => ({ response: 'timeout' })),
      this.fetch(`https://api.github.com/repos/${user}/${repo}`, {
        headers,
      }).then(async (response) => {
        if (response.ok) {
          return (await response.json()) as OrgRepoResponse;
        }
        return { response: 'error' };
      }),
    ]);
  }
}