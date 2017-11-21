# dappening
Contracts relating to the EthTrader DAO/token project

### Related repos
* [Karma collector](https://github.com/EthTrader/karma)
* [Pre-registration bot](https://github.com/EthTrader/regbot)
* [Browser plugin](https://github.com/EthTrader/plugin)
* [EthTrader dApp](https://github.com/EthTrader/EthTrader.github.io)
* [ICO review criteria](https://github.com/EthTrader/ico-review)

\copy
(WITH first_content AS (
  SELECT DISTINCT ON(author) author, extract(epoch from reddit_created_utc) AS firstContent FROM content ORDER BY author, reddit_created_utc ASC
  ),  scores AS (
  SELECT author, sum(score) as score FROM content GROUP BY author
  )
SELECT username, address, score, firstContent
FROM users
LEFT JOIN first_content on first_content.author = username
LEFT JOIN scores on scores.author = username
WHERE address IS NOT NULL)
To
'/tmp/users.csv'
With CSV HEADER;
