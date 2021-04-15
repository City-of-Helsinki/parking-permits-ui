# Parking permits UI

## Prerequisites

- Yarn
- Node 14+
- React 17

## Development

To start development environment, run:

```
$ yarn start
```

This will start [the application](http://localhost:3000) on port `3000`.

### Starting dockerized development environment

1. Check if Docker and docker CLI installed, port `3000` is free, not occupied by running server.

2. Start building docker image and start container:
   ```
   $ docker-compose up
   ```
3. Open `localhost:3000` on browser.

## Testing

To run tests:

```
$ yarn test
```
