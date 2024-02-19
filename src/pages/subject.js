import React, { useEffect, useState } from 'react';
import { DidIonMethod } from '@web5/dids';
import QRCode from 'qrcode.react';
import { deflate } from 'zlibjs/bin/zlib_and_gzip.min.js';
import { VerifiableCredential } from '@web5/credentials';

import html2canvas from 'html2canvas';

const SubjectPage = () => {

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
        button: {
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px',
        },
        label: {
            display: 'block',
            margin: '20px 0 10px',
        },
        textarea: {
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minHeight: '100px',
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
        clickable: {
            cursor: 'pointer',
        },
        credentialCardStyles: {
            border: '1px solid #007bff',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
            padding: '20px',
            margin: '20px 0',
            borderRadius: '10px',
            backgroundColor: '#f9f9f9',
            color: '#333',
            textAlign: 'center',
            maxWidth: '300px',
            margin: '20px auto'
        },
        credentialDetail: {
            fontSize: '16px',
            margin: '10px 0',
            color: '#555',
            fontWeight: 'bold'
        },
        credentialLabel: {
            fontSize: '14px',
            color: '#007bff',
            margin: '5px 0'
        }
    };

    const [jwt, setJWT] = useState('');
    const [subjectDID, setSubjectDid] = useState('');
    const [isDIDExpanded, setIsDIDExpanded] = useState(false);
    const [compressedJwt, setCompressedJwt] = useState('');
    const [credentialDetails, setCredentialDetails] = useState({})
    
    useEffect(() => {
        const createSubjectDid = async () => {
            const subjectDid = await DidIonMethod.create();
            setSubjectDid(subjectDid);
        };
        createSubjectDid();
    }, []);


    useEffect(() => {
        const processJWT = async () => {
        if (jwt) {
            try {
                const parsedVc = await VerifiableCredential.parseJwt({ vcJwt: jwt });
                setCredentialDetails({
                    type: parsedVc.vcDataModel.type[1],  // Adjust according to actual structure
                    issueDate: parsedVc.vcDataModel.issuanceDate,
                    legalDrinkAge: parsedVc.vcDataModel.credentialSubject.isOfLegalDrinkingAge
                });
                const compressed = deflate(jwt); 
                setCompressedJwt(compressed);
            } catch (error) {
                console.error('Error compressing JWT:', error);
                setCompressedJwt('');
            }
        }
        }
        processJWT();
    }, [jwt]);

    
    const handleChange = (e) => {
        setJWT(e.target.value);
        
    };

    const handleCopyDid = () => {
        navigator.clipboard.writeText(subjectDID.did);
    };

   const handleCopyJwt = () => {
        navigator.clipboard.writeText(jwt);
    }

    const toggleDIDView = () => {
        setIsDIDExpanded(!isDIDExpanded);
    };

    const displayDID = isDIDExpanded ? subjectDID.did : `${subjectDID.did?.substring(0, 20)}...`;

    const handleDownloadImage = async () => {
        const element = document.getElementById('print'),
        canvas = await html2canvas(element),
        data = canvas.toDataURL('image/jpg'),
        link = document.createElement('a');
    
        link.href = data;
        link.download = 'downloaded-image.jpg';
    
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Subject Page - You</h1>
            <p onClick={toggleDIDView} style={{ ...styles.clickable, ...styles.label }}>
                DID: {displayDID}
            </p>
            <button style={styles.button} onClick={handleCopyDid}>Copy DID</button>
            <button style={styles.button} onClick={handleCopyJwt}>Copy JWT</button>
            <label style={styles.label}>
                Paste Signed JWT:
                <textarea style={styles.textarea} value={jwt} onChange={handleChange} />
            </label>
            {jwt && (
                <div>
                    <div id="print" style={styles.credentialCardStyles}>
                        <p style={styles.credentialLabel}>Type:</p>
                        <p style={styles.credentialDetail}>{credentialDetails.type }</p>
                        <p style={styles.credentialLabel}>Issue Date:</p>
                        <p style={styles.credentialDetail}>{credentialDetails.issueDate}</p>
                        <p style={styles.credentialLabel}>Legal Drinking Age</p>
                        <p style={styles.credentialDetail}>{credentialDetails.expirationDate ? 'Yes' : 'No'}</p>
                        <p style={styles.credentialLabel}>Issued by:</p>
                        <p style={styles.credentialDetail}>The Fake DMV</p>
                    </div>
                {/* <QRCode value={compressedJwt} size={256} /> */}
                <button style={styles.button} onClick={handleDownloadImage}>Download Credential</button>
                <div style={styles.jwtContainer}>
                    <h2>Signed JWT:</h2>
                    <pre style={styles.pre}>{jwt}</pre>
            
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubjectPage;