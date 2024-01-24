import Link from 'next/link';

const IndexPage = () => {
  return (
    <div>
      <h1>Choose Role</h1>
      <div>
        <Link href="/issuer">
  
            <button>Issuer</button>

        </Link>
      </div>
      <div>
        <Link href="/subject">
 
            <button>Subject</button>

        </Link>
      </div>
      <div>
        <Link href="/verifier">

            <button>Verifier</button>

        </Link>
      </div>
    </div>
  );
};

export default IndexPage;
