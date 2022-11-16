# use-storage

A React Hook to handle localStorage properly in your WebApp:

```js
const DarkMode = () => {
  const [dark = false, setDark] = useStorage('darkmode');
  return (
    <div>
      <button active={dark} onClick={() => setDark(true)>Dark</button>
      <button active={!dark} onClick={() => setDark(false)>Light</button>
    </div>
  );
};
```

Then you can use the same value syncronized in any other part of the UI, for example in the profile:

```js
const Profile = () => {
  const [dark = false] = useStorage('darkmode');
  return <RenderProfile darkMode={dark} />;
};
```

You can store any data type, for example strings or objects:

```js
const UserProfile = () => {
  const [user = null, setUser] = useStorage('user');

  useEffect(() => {
    getUser.then(setUser);
  }, []);

  if (!user) return <Login />;
  return <Profile user={user} />;
}
```
