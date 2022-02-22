// ==UserScript==
// @name         wolfram2desmos
// @namespace    ezropp.Desmos
// @version      1.47
// @description  Converts ASCIImath into Desmos LaTeX.
// @author       Heavenira (Ezra Oppenheimer)
// @website      https://ezra.jackz.me/
// @match        https://*.desmos.com/calculator*
// @grant        none
// @downloadURL	 https://github.com/Heavenira/wolfram2desmos/raw/main/wolfram2desmos.user.js
// @updateURL	 https://github.com/Heavenira/wolfram2desmos/raw/main/wolfram2desmos.user.js
// ==/UserScript==


(function() {
	'use strict';

	function wolfram2desmos(input) {

		// returns the number of matches
		function count(expr) {
			if (input.match(expr) != null) {
				return input.match(expr).length;
			}
			else {
				return 0;
			}
		}
	
		// calculating any errors
		{
			// determines if the input IS ALREADY latex
			if (count(/((?<=\\left)\|)|(\\)|((\^|\_){)/g) > 0) {
				return input;
			}
	
			// determines if the brackets are correct
			if (count(/\(/g) > count(/\)/g)) {
				console.warn("Input has " + (count(/\(/g) - count(/\)/g)) + " more '(' characters than ')' characters");
				return input;
			}
			if (count(/\(/g) < count(/\)/g)) {
				console.warn("Input has " + (count(/\)/g) - count(/\(/g)) + " more ')' characters than '(' characters");
				return input;
			}
			if (count(/\|/g) % 2 == 1) {
				console.warn("Input has uneven '|' brackets");
				return input;
			}
		}
	
	
		// FUNCTIONS
	
		// returns the first match's index
		function find(expr) {
			return input.search(expr);
		}
	
		// replaces all matches with replacement
		function replace(expr,replacement) {
			input = input.replace(expr,replacement);
		}
	
		// inserts replacement at given index
		function insert(index,replacement) {
			if (index >= 0) {
				input = input.slice(0,index) + replacement + input.slice(index,input.length);
			}
		}
	
		// overwrites current index with replacement
		function overwrite(index,replacement) {
			input = input.slice(0,index) + replacement + input.slice(index + 1,input.length);
		}
	
		// iterates the bracket parser for ()
		function bracketEval1() {
			i++;
			if (input[i] == ")") {
				bracket += 1;
			}
			else if (input[i] == "(") {
				bracket -= 1;
			}
		}
	
		// iterates the bracket parser for {} and ()
		function bracketEval2() {
			i++;
			if (input[i] == ")" || input[i] == "}") {
				bracket += 1;
			}
			else if (input[i] == "(" || input[i] == "{") {
				bracket -= 1;
			}
		}
	
		// returns if the specified index is a "non-variable"
		function isOperator(index) {
			if (input[index] == undefined) {
				return true;
			}
			return !(/[A-Z\dΑ-ωϕ∞√א-תⒶ-Ⓩ\.'_\\]/gi).test(input[index]);
		}
	
	
		// PREPARATIONS
	
	
		// predefine some variables.
		let i, bracket, startingIndex, isOneArgument;
		input = " " + input + " "; // this gives some breathing space
	
		// preform prelimenary replacements
		{
		// symbolic replacements
			replace(/\n/g, "");
			replace(/(?<![A-Za-zΑ-ωϕ])sqrt/g, "√");
			replace(/(?<![A-Za-zΑ-ωϕ])infinity|infty/g, "∞");
			replace(/(?<![A-Za-zΑ-ωϕ])pm/g, "±");
			replace(/\>\=/g, "≥");
			replace(/\<\=/g, "≤");
			replace(/\!\=/g, "≠");
			replace(/\-\>/g, "→");
			replace(/(\s*(?=(\/|\^)))|((?<=(\/|\^))\s*)/g, "");
			replace(/\s*(mod|\%)\s*/g, "mod");
			replace(/\|/g, " | ");
			replace(/\sfor(?!.*\sfor).*/g, "");
			replace(/(\+|\-)\s*O\([A-Za-zΑ-ωϕ]\^\d*\)/g, "");
			replace(/\(Taylor series\)/g, "");
	
			// misc function replacements
			replace(/(?<![A-Za-zΑ-ωϕ])arcsinh/g, "Ⓐ"); // https://qaz.wtf/u/convert.cgi?
			replace(/(?<![A-Za-zΑ-ωϕ])arccosh/g, "Ⓑ");
			replace(/(?<![A-Za-zΑ-ωϕ])arctanh/g, "Ⓒ");
			replace(/(?<![A-Za-zΑ-ωϕ])arccsch/g, "Ⓓ");
			replace(/(?<![A-Za-zΑ-ωϕ])arcsech/g, "Ⓔ");
			replace(/(?<![A-Za-zΑ-ωϕ])arccoth/g, "Ⓕ");
			replace(/(?<![A-Za-zΑ-ωϕ])sinh/g, "Ⓖ");
			replace(/(?<![A-Za-zΑ-ωϕ])cosh/g, "Ⓗ");
			replace(/(?<![A-Za-zΑ-ωϕ])tanh/g, "Ⓘ");
			replace(/(?<![A-Za-zΑ-ωϕ])csch/g, "Ⓙ");
			replace(/(?<![A-Za-zΑ-ωϕ])sech/g, "Ⓚ");
			replace(/(?<![A-Za-zΑ-ωϕ])coth/g, "Ⓛ");
	
	
			replace(/(?<![A-Za-zΑ-ωϕ])binomial/g, "א"); // hebrew will be my function placeholders
			replace(/(?<![A-Za-zΑ-ωϕ])floor/g, "ב");
			replace(/(?<![A-Za-zΑ-ωϕ])ceiling/g, "ג");
			replace(/(?<![A-Za-zΑ-ωϕ])round/g, "ד");
			replace(/(?<![A-Za-zΑ-ωϕ])gcd|gcf/g, "ה");
			replace(/(?<![A-Za-zΑ-ωϕ])lcm/g, "ו");
			// "ז" is for mod final
			replace(/(?<![A-Za-zΑ-ωϕ])abs/g, "ח");
			replace(/(?<![A-Za-zΑ-ωϕ])arcsin/g, "ט");
			replace(/(?<![A-Za-zΑ-ωϕ])arccos/g, "י");
			replace(/(?<![A-Za-zΑ-ωϕ])arctan/g, "כ");
			replace(/(?<![A-Za-zΑ-ωϕ])arccsc/g, "ל");
			replace(/(?<![A-Za-zΑ-ωϕ])arcsec/g, "מ");
			replace(/(?<![A-Za-zΑ-ωϕ])arccot/g, "נ");
			replace(/(?<![A-Za-zΑ-ωϕ])sin/g, "ס");
			replace(/(?<![A-Za-zΑ-ωϕ])cos/g, "ע");
			replace(/(?<![A-Za-zΑ-ωϕ])tan/g, "פ");
			replace(/(?<![A-Za-zΑ-ωϕ])csc/g, "צ");
			replace(/(?<![A-Za-zΑ-ωϕ])sec/g, "ק");
			replace(/(?<![A-Za-zΑ-ωϕ])cot/g, "ר");
			replace(/(?<![A-Za-zΑ-ωϕ])log|ln/g, "ת");
	
			// latin replacements
			replace(/(?<![A-Za-zΑ-ωϕ])alpha/g, "α");
			replace(/(?<![A-Za-zΑ-ωϕ])beta/g, "β"); 
			replace(/(?<![A-Za-zΑ-ωϕ])Gamma/g, "Γ");
			replace(/(?<![A-Za-zΑ-ωϕ])gamma/g, "γ");
			replace(/(?<![A-Za-zΑ-ωϕ])Delta/g, "Δ");
			replace(/(?<![A-Za-zΑ-ωϕ])delta/g, "δ");
			replace(/(?<![A-Za-zΑ-ωϕ])epsilon/g, "ε");
			replace(/(?<![A-Za-zΑ-ωϕ])zeta/g, "ζ");
			replace(/(?<![A-Za-zΑ-ωϕ])eta/g, "η");
			replace(/(?<![A-Za-zΑ-ωϕ])Theta/g, "Θ");
			replace(/(?<![A-Za-zΑ-ωϕ])theta/g, "θ");
			replace(/(?<![A-Za-zΑ-ωϕ])iota/g, "ι"); 
			replace(/(?<![A-Za-zΑ-ωϕ])kappa/g, "κ");
			replace(/(?<![A-Za-zΑ-ωϕ])Lambda/g, "Λ");
			replace(/(?<![A-Za-zΑ-ωϕ])lambda/g, "λ");
			replace(/(?<![A-Za-zΑ-ωϕ])mu/g, "μ");
			replace(/(?<![A-Za-zΑ-ωϕ])nu/g, "ν");
			replace(/(?<![A-Za-zΑ-ωϕ])Xi/g, "Ξ");
			replace(/(?<![A-Za-zΑ-ωϕ])xi/g, "ξ");
			replace(/(?<![A-Za-zΑ-ωϕ])Pi/g, "Π");
			replace(/(?<![A-Za-zΑ-ωϕ])pi/g, "π");
			replace(/(?<![A-Za-zΑ-ωϕ])rho/g, "ρ");
			replace(/(?<![A-Za-zΑ-ωϕ])Sigma/g, "Σ");
			replace(/(?<![A-Za-zΑ-ωϕ])sigma/g, "σ");
			replace(/(?<![A-Za-zΑ-ωϕ])tau/g, "τ");
			replace(/(?<![A-Za-zΑ-ωϕ])Upsilon/g, "Τ");
			replace(/(?<![A-Za-zΑ-ωϕ])upsilon/g, "υ");
			replace(/(?<![A-Za-zΑ-ωϕ])Phi/g, "Φ");
			replace(/(?<![A-Za-zΑ-ωϕ])phi/g, "φ");
			replace(/(?<![A-Za-zΑ-ωϕ])chi/g, "χ");
			replace(/(?<![A-Za-zΑ-ωϕ])Psi/g, "Ψ");
			replace(/(?<![A-Za-zΑ-ωϕ])psi/g, "ψ");
			replace(/(?<![A-Za-zΑ-ωϕ])Omega/g, "Ω");
			replace(/(?<![A-Za-zΑ-ωϕ])omega/g, "ω");
			replace(/ϕ/g, "φ");

			replace(/(?<![A-Za-zΑ-ωϕ])constant/g, "C");
		}
	
		
		// PARSING
	
		// implement square roots
		while (find(/√\(/g) != -1) {
			i = find(/√\(/g) + 1;
			overwrite(i,"{");
			bracket = 0;
			while (i < input.length) {
				bracketEval1();
				if (bracket == 1) {
					overwrite(i,"}");
					i = input.length;
				}
			}
		}
	
		// implement exponents
		while (find(/\^/g) != -1) {
			i = find(/\^/g);
			overwrite(i, "↑");
			i++;
			if (input[i] == "(") {
				overwrite(i,"{");
				bracket = -1;
				while (i < input.length) {
					bracketEval1();
					if (bracket == 0) {
						overwrite(i,"}");
						i = input.length;
					}
				}
			}
			else {
				insert(i,"{");
				while (i < input.length) {
					i++;
					if (isOperator(i)) {
						insert(i, "}");
						i = input.length;
					}
				}
			}
		}
		replace(/↑/g,"^");
		
		// implement fractions
		while (find(/\//g) != -1) {
			startingIndex = find(/\//g);

			// implement the numerator; prior to the slash
			{
				i = startingIndex;
			
				// preceded by a ")" scenario
				if (input[i - 1] == ")") {
					overwrite(i - 1, "}");
					bracket = 1;
					while (i > 0) {
						i -= 2;
						bracketEval1();
						if (bracket == 0) {
							if (input[i - 1].match(/[A-ZΑ-ωϕא-תⒶ-Ⓩ√]/gi) != null) {
								insert(startingIndex - 1, ")");
								insert(i - 1, "\\frac{");
								startingIndex += 7;
							}
							else {
								overwrite(i, "\\frac{");
								startingIndex += 5;
							}
							i = 0;
						}
					}
				}

				// preceded WITHOUT a ")" scenario
				else {
					insert(i, "}");
					startingIndex += 1;
					while (i > 0) {
						i -= 1;
						if (isOperator(i)) {
							insert(i + 1, "\\frac{");
							startingIndex += 6;
							i = 0;
						}
					}
				}
			}
			
			// implement the denominator; after the slash 
			{
				i = startingIndex + 1;
		
				// reciprocal function scenario
				// this happens when a function begins the denominator
				let isFunction = (startingIndex == find(/\/((\-)|([A-ZΑ-ωϕא-תⒶ-Ⓩ√∞\_])|(\-([A-ZΑ-ωϕא-תⒶ-Ⓩ√∞\_])))(\(|\{)/gi));
				if (isFunction) {
					insert(i, "{(");
					i += 3;
					bracket = -2;
					while (i < input.length) {
						bracketEval2();
						if (bracket == -1) {
							if (input[i + 1] == "^") {
							// in this situation, as pointed by SlimRunner, there is an exponent at the end of the fraction. we need to correct this by including it in the denominator
								bracket = -1;
								i++;
								while (i < input.length) {
									bracketEval2();
									if (bracket == 0) {
										break;
									}
								}
							}
							insert(i + 1, ")}");
							i = input.length;
						}
					}
				}
	
				// following a "(" scenario
				else if (input[i] == "(") {
					overwrite(i, "{");
					bracket = -1;
					while (i < input.length) {
						bracketEval1();
						if (bracket == 0) {
							if (input[i + 1] == "^") {
							// in this situation, as pointed by SlimRunner, there is an exponent at the end of the fraction. we need to correct this by including it in the denominator
								bracket = 0;
								i++;
								while (i < input.length) {
									bracketEval2();
									if (bracket == 0) {
										insert(startingIndex + 2, "(");
										insert(i + 1, "}");
										i = input.length;
									}
								}
							}
							else {
								overwrite(i, "}");
							}
							i = input.length;
						}
					}
				}
	
				// following WITHOUT a "(" scenario
				else {
					insert(i, "{");
					while (i < input.length) {
						i++;
						if (input[i] == "^") {
						// in this situation, as pointed by SlimRunner, there is an exponent at the end of the fraction. we need to correct this by including it in the denominator
							bracket = -1;
							i++;
							while (i < input.length) {
								bracketEval2();
								if (bracket == 0) {
									insert(i + 1, "}");
									i = input.length;
								}
							}
						}
						else if (isOperator(i)) {
							insert(i, "}");
							i = input.length;
						}
					}
				}
			}
			overwrite(startingIndex, "");
		}

		// implement summation and products
		while (find(/(sum|prod(uct|))_\([A-Za-z\dΑ-ω∞א-תⒶ-Ⓩ\_\\]+\s*=\s*[A-Za-z\dΑ-ω∞א-תⒶ-Ⓩ\_\\]+\)/g) != -1) {
			i = find(/(sum|prod(uct|))_\([A-Za-z\dΑ-ω∞א-ת\_\\]+\s*=\s*[A-Za-z\dΑ-ω∞א-ת\_\\]+\)/g) + 4;
			if (input[i] == "u") {
				i += 4;
			}
			else if (input[i] == "_") {
				i ++;
			}
			overwrite(i, "{");
			bracket = -1;
			while (i < input.length) {
				bracketEval1();
				if (bracket == 0) {
					overwrite(i, "}");
					break;
				}
			}
		}
		
		// implement subscripts (digit scenario)
		while (find(/_\d/g) != -1) {
			i = find(/_\d/g) + 1;
			insert(i, "{");
			while (i < input.length) {
				i++;
				if (isOperator(i)) {
					insert(i,"}");
					i = input.length;
				}
			}
		}

		// implement subscripts (bracket scenario)
		while (find(/\_\(/g) != -1) {
			i = find(/\_\(/g) + 1;
			bracket = -1;
			overwrite(i, "{");
			while (i < input.length) {
				bracketEval2();
				if (bracket == 0) {
					overwrite(i, "}");
					i = input.length;
				}
			}
		}
	
		// implement modulos
		// THIS USES THE SAME CODE AS THE FRACTION PARSER
		while (find(/mod/g) != -1) {
			startingIndex = find(/mod/g);
			isOneArgument = true;
	
			// first check if the modulus is using 2-arguments instead of 1. if this is the case, we don't have to worry any further.
			i = startingIndex + 3;
			if (input[i] == "(") {
				bracket = -1;
				while (i < input.length) {
					bracketEval1();
					if (bracket == -1 && input[i] == ",") {
						isOneArgument = false;
						break;
					}
					if (bracket == 0) {
						overwrite(i, "");
						overwrite(startingIndex + 3, "");
						break;
					}
				}
			}
	
			if (isOneArgument) {
			// before the modulus
				{
					i = startingIndex;
					// preceded with a ")" scenario
					if (input[i - 1] == ")") {
						overwrite(i - 1, "");
						bracket = 1;
						while (i > 0) {
							i -= 2;
							bracketEval1();
							if (bracket == 0) {
								overwrite(i, "ז(");
								startingIndex += 1;
								break;
							}
						}
					}
	
					// preceded WITHOUT a ")" scenario
					else {
						while (i > 0) {
							i -= 1;
							if (isOperator(i)) {
								insert(i + 1, "ז(");
								startingIndex += 2;
								break;
							}
						}
					}
				}
		
				// after the modulus 
				{
					i = startingIndex + 3;
		
					// this happens when a function begins the modulus
					let isFunction = (startingIndex == find(/mod((\-)|([A-ZΑ-ωϕא-ת√∞\_])|(\-([A-ZΑ-ωϕא-ת√∞\_])))(\(|\{)/gi));
					if (isFunction) {
						insert(i, "(");
						i += 2;
						bracket = -1;
						while (i < input.length) {
							bracketEval2();
							if (bracket == 0) { // bracket == -1
								if (input[i + 1] == "^") {
									// in this situation, as pointed by SlimRunner, there is an exponent at the end of the fraction. we need to correct this by including it in the denominator
									bracket = -1;
									i++;
									while (i < input.length) {
										bracketEval2();
										if (bracket == 0) {
											break;
										}
									}
								}
								insert(i + 1, ")");
								i = input.length;
							}
						}
					}
	
	
					// following WITHOUT a "(" scenario
					else {
						insert(i, "(");
						while (i < input.length) {
							i++;
							if (input[i] == "^") {
								// in this situation, as pointed by SlimRunner, there is an exponent at the end of the fraction. we need to correct this by including it in the denominator
								bracket = -1;
								i++;
								while (i < input.length) {
									bracketEval2();
									if (bracket == 0) {
										insert(i + 1, ")");
										i = input.length;
									}
								}
							}
							else if (isOperator(i)) {
								insert(i, ")");
								i = input.length;
							}
						}
					}
				}
				replace(/mod\(/,",");
			}
			else {
				replace(/mod\(/,"ז(");
			}
	
		}
	
		// implement absolutes
		while (find(/ח\(/g) != -1) {
			i = find(/ח\(/g);
			replace(/ח\(/, "⟨");
			bracket = -1;
			while (i < input.length) {
				bracketEval2();
				if (bracket == 0) {
					overwrite(i, "⟩");
					i = input.length;
				}
			}
		}
		while (find(/\|/g) != -1) {
			i = find(/\|/g);
			overwrite(i, "⟨");
			bracket = -1;
			while (i < input.length) {
				bracketEval2();
				if (bracket == -1 && input[i] == "|") {
					overwrite(i, "⟩");
					i = input.length;
				}
			}
		}
	
		// correct "use parens" scenario
		while(find(/[א-תⒶ-Ⓩ]\^\{/g) != -1) {
			startingIndex = find(/[א-תⒶ-Ⓩ]\^\{/g);
			i = startingIndex  + 2;
			bracket = -1;
			while (i < input.length) {
				bracketEval2();
				if (bracket == 0) {
					let slicedPortion = input.slice(startingIndex + 2, i + 1);
	
					// if there is no "(" after the exponent || it's trig^{-1|2}, then drop this.
					if (input[i + 1] != "(" || (input[startingIndex].match(/[ס-רⒼ-Ⓛ]/g) != null && (slicedPortion == "{-1}" || slicedPortion == "{2}"))) {
						overwrite(startingIndex + 1, "↑");
						i = input.length;
					}
					// if there is no "(" after the exponent || it's arctrig^{2}, then drop this.
					else if (input[i + 1] != "(" || (input[startingIndex].match(/[ט-נⒶ-Ⓕ]/g) != null && slicedPortion == "{2}")) {
						overwrite(startingIndex + 1, "↑");
						i = input.length;
					}
					else {
						input = input.slice(0, startingIndex + 1) + input.slice(i + 1, input.length);
						i -= slicedPortion.length + 1;
						while (i < input.length) {
							bracketEval2();
							if (bracket == 0) {
								insert(i + 1, "↑" + slicedPortion);
								i = input.length;
							}
						}
					}
				}
			}
		}
		replace(/↑/g,"^");

		// remove excess brackets
		while (find(/{\(/g) != -1) {
			startingIndex = find(/{\(/g);
			i = startingIndex + 1;
			bracket = -1;
			while (i < input.length) {
				bracketEval2();
				if (bracket == 0) {
					if (input[i + 1] == "}") {
						overwrite(i, "");
						overwrite(startingIndex + 1, "");
					}
					else {
						overwrite(startingIndex, "⟦");
					}
					i = input.length;
				}
			}
		}
		replace(/⟦/g, "{");

		// implment proper brackets when all the operator brackets are gone
		replace(/\(/g,"\\left\(");
		replace(/\)/g,"\\right\)");
		replace(/\⟨/g,"\\left\|");
		replace(/\⟩/g,"\\right\|");
	
		// perform concluding replacements
		{
		// function replacements
			replace(/int(egral|)\s*_\s*\{/g, "\\int_{");
			replace(/int(egral|)(?!\s*(_|e))/g, "\\int_{0}^{t}");
			replace(/(?<!\\)int(egral|)/g, "\\int");
			replace(/sum_/g, "\\sum_");
			replace(/prod(uct|)_/g, "\\prod_");
			replace(/\\frac\{\}/g, "\\frac{1}");
			replace(/lim_/g, "\\mathrm{lim}_");
	
			// symbolic replacements
			replace(/√/g, "\\sqrt");
			replace(/(\*)|((?<=\d)\s+(?=\d))/g, "\\times ");
			replace(/≠/g, "\\ne");
			replace(/∞[A-Za-z]/g, "\\infty");
			replace(/∞/g, "\\infty");
			replace(/±/g, "\\pm");
			replace(/^\s/g, "");
			replace(/\s$/g, "");
			replace(/\s\s/g, "");
	
			replace(/Ⓐ/g,"arcsinh");
			replace(/Ⓑ/g,"arccosh");
			replace(/Ⓒ/g,"arctanh");
			replace(/Ⓓ/g,"arccsch");
			replace(/Ⓔ/g,"arcsech");
			replace(/Ⓕ/g,"arccoth");
			replace(/Ⓖ/g,"sinh");
			replace(/Ⓗ/g,"cosh");
			replace(/Ⓘ/g,"tanh");
			replace(/Ⓙ/g,"csch");
			replace(/Ⓚ/g,"sech");
			replace(/Ⓛ/g,"coth");
	
			replace(/א/g, "\\operatorname{nCr}");
			replace(/ב/g, "\\operatorname{floor}");
			replace(/ג/g, "\\operatorname{ceil}");
			replace(/ד/g, "\\operatorname{round}");
			replace(/ה/g, "\\operatorname{gcd}");
			replace(/ו/g, "\\operatorname{lcm}");
			replace(/ז/g, "\\operatorname{mod}");
			replace(/ח/g, "\\operatorname{abs}");
			replace(/ט/g, "\\arcsin");
			replace(/י/g, "\\arccos");
			replace(/כ/g, "\\arctan");
			replace(/ל/g, "\\arccsc");
			replace(/מ/g, "\\arcsec");
			replace(/נ/g, "\\arccot");
			replace(/ס/g, "\\sin");
			replace(/ע/g, "\\cos");
			replace(/פ/g, "\\tan");
			replace(/צ/g, "\\csc");
			replace(/ק/g, "\\sec");
			replace(/ר/g, "\\cot");
			replace(/ת(?!_)/g, "\\ln");
			replace(/ת/g, "\\log");
			replace(/(?<!\\)ת/g, "\\ln");
	
			// latin replacements
			replace(/α/g, "\\alpha");
			replace(/β/g, "\\beta");
			replace(/Γ/g, "\\Gamma");
			replace(/γ/g, "\\gamma");
			replace(/Δ/g, "\\Delta");
			replace(/δ/g, "\\delta");
			replace(/ε/g, "\\epsilon");
			replace(/ζ/g, "\\zeta");
			replace(/η/g, "\\eta");
			replace(/Θ/g, "\\Theta");
			replace(/θ/g, "\\theta");
			replace(/ι/g, "\\iota");
			replace(/κ/g, "\\kappa");
			replace(/Λ/g, "\\Lambda");
			replace(/λ/g, "\\lambda");
			replace(/μ/g, "\\mu");
			replace(/ν/g, "\\nu");
			replace(/Ξ/g, "\\Xi");
			replace(/ξ/g, "\\xi");
			replace(/Π/g, "\\Pi");
			replace(/π/g, "\\pi");
			replace(/ρ/g, "\\rho");
			replace(/Σ/g, "\\Sigma");
			replace(/σ/g, "\\sigma");
			replace(/τ/g, "\\tau");
			replace(/Τ/g, "\\Upsilon");
			replace(/υ/g, "\\upsilon");
			replace(/Φ/g, "\\Phi");
			replace(/φ/g, "\\phi");
			replace(/ϕ/g, "\\phi");
			replace(/χ/g, "\\chi");
			replace(/Ψ/g, "\\Psi");
			replace(/ψ/g, "\\psi");
			replace(/Ω/g, "\\Omega");
			replace(/ω/g, "\\omega");
			replace(/polygamma/g, "\\psi_{poly}");
		}

		return input;
	}

	wolfram2desmos("d/dx(cos(x + 1)/(x^2 + 3)) = -((x^2 + 3) sin(x + 1) + 2 x cos(x + 1))/(x^2 + 3)^2");
	wolfram2desmos("ζ(x) = (-1)^x/(x (-2 + x)!) integral_0^1 (log(1 - t^(-1 + x))/t)^x dt for (x element Z and x>=2)");

	function typeInTextArea(newText, el = document.activeElement) {
		const start = el.selectionStart;
		const end = el.selectionEnd;
		const text = el.value;
		const before = text.substring(0, start);
		const after  = text.substring(end, text.length);
		el.value = (before + newText + after);
		el.selectionStart = el.selectionEnd = start + newText.length;
		el.focus();
	}

	function pasteHandler(e) {
		let pasteData =  (e.clipboardData || window.clipboardData).getData('Text');
	
		if (pasteData && Calc.getExpressions().find(item => item.id == Calc.selectedExpressionId).type == "expression") {
			// stop data from actually being pasted
			e.stopPropagation();
			e.preventDefault();
	
			pasteData = wolfram2desmos(pasteData);
	
			typeInTextArea(pasteData);
	
		}
	}
	

	// listener; checks when the user presses CTRL+V and activates the script
	function wolfram2desmosListener() {
		let xpn = document.querySelector('.dcg-exppanel-outer');
		xpn.addEventListener('focusin', (e) => {
			let txa = e.target.parentElement.parentElement;
			txa.addEventListener('paste', pasteHandler, false);
		}, false);
		xpn.addEventListener('focusout', (e) => {
			let txa = e.target.parentElement.parentElement;
			txa.removeEventListener('paste', pasteHandler, false);
		}, false);
		console.log("wolfram2desmos loaded properly ✔️\n_   _ _____ ___  _   _ _____ _   _ ___________  ___  \n| | | |  ___/ _ \\| | | |  ___| \\ | |_   _| ___ \\/ _ \\ \n| |_| | |__/ /_\\ | | | | |__ |  \\| | | | | |_/ / /_\\ \\\n|  _  |  __|  _  | | | |  __|| . ` | | | |    /|  _  |\n| | | | |__| | | \\ \\_/ | |___| |\\  |_| |_| |\\ \\| | | |\n\\_| |_\\____\\_| |_/\\___/\\____/\\_| \\_/\\___/\\_| \\_\\_| |_/");
	}
	
	// pauses the code to prevent possible error
	setTimeout(wolfram2desmosListener, 2000);
})();
