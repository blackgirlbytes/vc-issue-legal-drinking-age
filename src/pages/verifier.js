import React, { useState, useEffect } from "react";
import { VerifiableCredential, PresentationExchange } from "@web5/credentials";
import { DidIonMethod } from "@web5/dids";

const VerifierPage = () => {
  const [jwt, setJwt] = useState("");
  const [verifierDid, setVerifierDid] = useState("");
  const [isVerificationSuccessful, setIsVerificationSuccessful] =
    useState(false);
  const [isPresentationDefinitionValid, setIsPresentationDefinitionValid] =
    useState(false);
  const [isPresentationExchangeSatisfied, setIsPresentationExchangeSatisfied] =
    useState(false);
  const [isDIDExpanded, setIsDIDExpanded] = useState(false);

  const styles = {
    container: {
      fontFamily: "Arial, sans-serif",
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
    },
    header: {
      textAlign: "center",
      color: "#333",
    },
    textarea: {
      width: "100%",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      minHeight: "100px",
      marginTop: "10px",
    },
    button: {
      display: "block",
      padding: "10px 15px",
      backgroundColor: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "10px",
    },
    resultsContainer: {
      marginTop: "20px",
      padding: "10px",
      backgroundColor: "#f7f7f7",
      border: "1px solid #ddd",
    },
    clickable: {
      cursor: "pointer",
    },
  };

  useEffect(() => {
    const createVerifierDid = async () => {
      const verifierDid = await DidIonMethod.create();
      setVerifierDid(verifierDid);
    };
    createVerifierDid();
  }, []);

  const displayDID = isDIDExpanded
    ? verifierDid.did
    : `${verifierDid.did?.substring(0, 20)}...`;
  const toggleDIDView = () => {
    setIsDIDExpanded(!isDIDExpanded);
  };
  const handleJwtChange = (event) => {
    setJwt(event.target.value);
  };

  const verifyCredential = async () => {
    try {
      // Verify the Verifiable Credential
      await VerifiableCredential.verify({ vcJwt: jwt });
      setIsVerificationSuccessful(true);

      // Define your presentation definition
      const presentationDefinition = {
        id: "presDefId123",
        name: "Legal Drinking Age Presentation Definition",
        purpose: "for verifying legal drinking age",
        input_descriptors: [
          {
            id: "legalDrinkingAge",
            purpose: "Are you of legal drinking age?",
            constraints: {
              fields: [
                {
                  path: ["$.credentialSubject.isOfLegalDrinkingAge"],
                },
              ],
            },
          },
          {
            id: "location",
            purpose: "City and Country",
            constraints: {
              fields: [
                {
                  path: ["$.credentialSubject.city"],
                },
                {
                  path: ["$.credentialSubject.country"],
                },
              ],
            },
          },
        ],
      };

      // Validate Presentation Definition
      PresentationExchange.validateDefinition({ presentationDefinition });
      setIsPresentationDefinitionValid(true);

      // Handle presentation exchange
      PresentationExchange.satisfiesPresentationDefinition({
        vcJwts: [jwt],
        presentationDefinition,
      });
      setIsPresentationExchangeSatisfied(true);
    } catch (error) {
      console.error("Verification or presentation exchange failed:", error);
      setIsVerificationSuccessful(false);
      setIsPresentationDefinitionValid(false);
      setIsPresentationExchangeSatisfied(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Verifier Page - Alcohol Vendor</h1>
      <p onClick={toggleDIDView} style={styles.clickable}>
        DID: {displayDID}
      </p>
      <textarea
        style={styles.textarea}
        value={jwt}
        onChange={handleJwtChange}
        placeholder="Enter Signed JWT here"
      />
      <button style={styles.button} onClick={verifyCredential}>
        Verify Credential
      </button>
      {isVerificationSuccessful && (
        <div style={styles.resultsContainer}>
          <p>Verification successful: {isVerificationSuccessful.toString()}</p>
          <p>
            Presentation definition valid:{" "}
            {isPresentationDefinitionValid.toString()}
          </p>
          <p>
            Presentation exchange satisfied:{" "}
            {isPresentationExchangeSatisfied.toString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifierPage;
