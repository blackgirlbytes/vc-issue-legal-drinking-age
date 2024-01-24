import React, { useEffect, useState } from 'react';
import { VerifiableCredential } from '@web5/credentials';
import { DidIonMethod } from '@web5/dids';

const IssuerPage = () => {
    const styles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            maxWidth: '600px',
            margin: '0 auto',
        },
        header: {
            textAlign: 'center',
            color: '#333',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        label: {
            fontWeight: 'bold',
        },
        input: {
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
        },
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
        },
        jwtContainer: {
            marginTop: '20px',
            backgroundColor: '#f7f7f7',
            border: '1px solid #ddd',
            padding: '10px',
        },
        pre: {
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        },

    };
    const [issuerDid, setIssuerDid] = useState('');
    const [isDIDExpanded, setIsDIDExpanded] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        isOfLegalDrinkingAge: false,
        city: '',
        country: '',
        subjectDID: '',
    });
    const [signedJWT, setSignedJWT] = useState('');

    useEffect(() => {
        const createIssuerDid = async () => {
            const issuerDid = await DidIonMethod.create();
            setIssuerDid(issuerDid);
        };
        createIssuerDid();
    }
    , []);
    
    const toggleDIDView = () => {
        setIsDIDExpanded(!isDIDExpanded);
    };

    const displayDID = isDIDExpanded ? issuerDid.did : `${issuerDid.did?.substring(0, 20)}...`;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const handleIssueCredential = async () => {
        try {  

            // Create new credential
            const vc = await VerifiableCredential.create({
                type: 'LegalDrinkingAgeCredential',
                issuer: issuerDid.did,
                subject: formData.subjectDID,
                data: {
                    name: formData.name,
                    dob: formData.dob,
                    isOfLegalDrinkingAge: formData.isOfLegalDrinkingAge,
                    city: formData.city,
                    country: formData.country,
                },
            });

            // Sign credential
            const signedVcJwt = await vc.sign({ did: issuerDid });

            setSignedJWT(signedVcJwt);
        } catch (error) {
            console.error('Error issuing credential:', error);
        }
    };
    const handleCopyJWT = () => {
        navigator.clipboard.writeText(signedJWT);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Issuer Page - Department of Motor Vehicles</h1>
            <p onClick={toggleDIDView} style={{ cursor: 'pointer' }}>
                DID: {displayDID}
            </p>
            <form style={styles.form}>
                <label>
                    Name:
                    <input type="text" name="name" onChange={handleChange} />
                </label>
                <label>
                    Date of Birth:
                    <input type="date" name="dob" onChange={handleChange} />
                </label>
                <label>
                    Is of Legal Drinking Age:
                    <input type="checkbox" name="isOfLegalDrinkingAge" onChange={handleChange} />
                </label>
                <label>
                    City:
                    <input type="text" name="city" onChange={handleChange} />
                </label>
                <label>
                    Country:
                    <input type="text" name="country" onChange={handleChange} />
                </label>
                <label>
                    Subject's DID:
                    <input type="text" name="subjectDID" onChange={handleChange} />
                </label>
                <button  type="button" onClick={handleIssueCredential}>
                    Issue Credential
                </button>
            </form>
            <button type="button" onClick={handleCopyJWT}>Copy JWT</button>
            {signedJWT && (
                <div style={styles.jwtContainer}>
                    <h2>Signed JWT:</h2>
                    <pre style={styles.pre}>{signedJWT}</pre>
                </div>
            )}
        </div>
    );
};

export default IssuerPage;
