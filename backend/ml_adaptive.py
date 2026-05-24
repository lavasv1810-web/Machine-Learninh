from typing import Any

from sklearn.feature_extraction import DictVectorizer
from sklearn.tree import DecisionTreeClassifier

class AdaptiveDecisionModel:
    def __init__(self):
        self.vectorizer = DictVectorizer(sparse=False)
        self.classifier = DecisionTreeClassifier(max_depth=4, random_state=42)
        self._train()

    def _train(self) -> None:
        training_examples = [
            {
                "action": "SCAN",
                "target": "WAN",
                "tools": "Nmap",
                "mitre_id": "T1046",
                "label": "Monitor and delay",
            },
            {
                "action": "BRUTE_FORCE",
                "target": "WEB_FA1",
                "tools": "Hydra",
                "mitre_id": "T1110",
                "label": "Engage honeypot",
            },
            {
                "action": "EXPLOIT",
                "target": "WEB_FA1",
                "tools": "BurpSuite",
                "mitre_id": "T1210",
                "label": "Redirect to fake service",
            },
            {
                "action": "INJECT",
                "target": "DB_FA1",
                "tools": "SQLMap",
                "mitre_id": "T1190",
                "label": "Isolate and capture",
            },
            {
                "action": "DATA_EXFIL",
                "target": "DB_FA1",
                "tools": "Custom Script",
                "mitre_id": "T1041",
                "label": "Cut channel and preserve evidence",
            },
            {
                "action": "EXPLOIT",
                "target": "DB1",
                "tools": "SQLMap",
                "mitre_id": "T1190",
                "label": "Deploy trap and isolate DB",
            },
            {
                "action": "BRUTE_FORCE",
                "target": "API_FA1",
                "tools": "Hydra",
                "mitre_id": "T1110",
                "label": "Increase WAF protection",
            },
            {
                "action": "SCAN",
                "target": "WEB1",
                "tools": "Masscan",
                "mitre_id": "T1046",
                "label": "Monitor and delay",
            },
            {
                "action": "DATA_EXFIL",
                "target": "API_FA2",
                "tools": "Cobalt Strike",
                "mitre_id": "T1105",
                "label": "Terminate channel and redirect",
            },
        ]

        X = [self._vectorize_features(example) for example in training_examples]
        y = [example["label"] for example in training_examples]
        self.classifier.fit(X, y)

    def _vectorize_features(self, event: dict[str, Any]) -> dict[str, Any]:
        return {
            "action": event.get("action", "unknown"),
            "target": event.get("target", "unknown"),
            "tools": " ".join(event.get("tools", [])) if isinstance(event.get("tools"), list) else event.get("tools", "unknown"),
            "mitre_id": event.get("mitre_id", "unknown"),
        }

    def predict(self, event: dict[str, Any]) -> dict[str, Any]:
        features = self._vectorize_features(event)
        X = self.vectorizer.transform([features])
        prediction = self.classifier.predict(X)[0]
        probabilities = self.classifier.predict_proba(X)[0]
        confidence = float(max(probabilities))
        next_target = self._suggest_next_target(event)
        explanation = self._build_explanation(event, prediction)
        return {
            "predicted_response": prediction,
            "confidence": round(confidence, 2),
            "next_likely_target": next_target,
            "explanation": explanation,
        }

    def _build_explanation(self, event: dict[str, Any], prediction: str) -> str:
        action = event.get("action", "unknown")
        target = event.get("target", "unknown")
        tools = event.get("tools", [])
        tools_text = ", ".join(tools) if isinstance(tools, list) else tools
        if prediction == "Monitor and delay":
            return f"Low-risk reconnaissance detected on {target} using {tools_text}; hold and observe to collect attacker behavior."
        if prediction == "Engage honeypot":
            return f"Brute-force tactics on decoy assets indicate active intrusion; engage the honeypot to trap the attacker."
        if prediction == "Redirect to fake service":
            return f"Exploit-style activity on {target} suggests a deception redirect will keep the attacker busy while preserving the real asset."
        if prediction == "Isolate and capture":
            return f"Database injection flow seen with {tools_text}; isolate the session and capture forensic data."
        if prediction == "Terminate channel and redirect":
            return f"Confirmed exfiltration or C2 behavior; terminate the channel and reroute the attacker into deception."
        if prediction == "Cut channel and preserve evidence":
            return f"Containment is required to stop the attack while keeping evidence intact."
        return f"Adaptive response selected because {action} on {target} matched the trained deception policy."

    def _suggest_next_target(self, event: dict[str, Any]) -> str:
        if event.get("action") in ["SCAN", "BRUTE_FORCE"]:
            return "WEB_FA1"
        if event.get("target") in ["WEB_FA1", "WEB1"]:
            return "DB_FA1"
        if event.get("target") in ["DB_FA1", "DB1"]:
            return "API_FA2"
        return "WEB1"
