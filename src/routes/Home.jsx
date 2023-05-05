import Join from '../components/Join';
import Host from '../components/Host';

/**
 * Home component that renders the Join and Host components.
 * @return {JSX.Element} JSX element containing the Join and Host components.
 */
function Home(props) {
    const { setRoom } = props;

    return (
        <div id="home-container"><Join setRoom={setRoom}/><Host setRoom={setRoom}/></div>
    )
}

export default Home