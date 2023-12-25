# swrize

SWR for functions

```javascript
import swrize from "swrize";

const myFunc = swrize(
  async (foo) => {
    const res = await fetch(`https://example.com/${foo}`);
    return res.json();
  },
  {
    staleWhileRevalidate: 3600 * 24 * 7,
    maxAge: 3600,
  }
);
```
