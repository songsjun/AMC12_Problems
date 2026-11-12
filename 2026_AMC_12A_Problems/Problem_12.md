# 2026 AMC 12A Problem 12

## Problem
Ethan writes down five congruences:


$$
x \equiv 0 \pmod{2}, \quad x \equiv 0 \pmod{3}, \quad x \equiv 1 \pmod{4}, \quad x \equiv 5 \pmod{6}, \quad x \equiv 7 \pmod{12}
$$

How many positive integers less than or equal to $2026$ satisfy at least one of these five congruences?



$$
\textbf{(A) } 1688 \qquad
\textbf{(B) } 1856 \qquad
\textbf{(C) } 1857 \qquad
\textbf{(D) } 2025 \qquad
\textbf{(E) } 2026
$$



## Solution 1
We perform casework on the residues modulo $12$:
- The residues $0,2,4,6,8,10$ correspond to $x\equiv 0\pmod{2}$.
- The residues $0,3,6,9$ correspond to $x\equiv 0\pmod{3}$.
- The residues $1,5,9$ correspond to $x\equiv 1\pmod{4}$.
- The residues $5,11$ correspond to $x\equiv 5\pmod{6}$.
- The residue $7$ corresponds to $x\equiv 7\pmod{12}$.
Each residue appears at least once in the list above, hence all integers $x$ satisfy one of these congruences, or $\boxed{\textbf{(E)}}$.

~ [eevee9406](https://artofproblemsolving.com/wiki/index.php/User:Eevee9406)

## Solution 2
This is the first part of AMC 12 so you realize that the problems are not going to be too complex. Write the first few numbers and you can see that they all fit into at least one category. So, you assume that all numbers work, giving you an answer of $\boxed{\text{2026}}$.

~ hb12

## Solution 3
Notice that all the moduli have a lowest common multiple of $12$, thus if all positive integers between $1$ and $12$ satisfy at least one of the given conditions, then we can simply add $12$ to every single one, and it will satisfy at least the same condition as it does in the base case of integers between $1$ and $12$. For example, the number $5$ satisfies the condition $x \equiv 5 \pmod{6}$, thus if you add $12$, and because $6$ is a factor of $12$, $5+12=17 \equiv 5 \pmod{6}$. Simply testing all numbers from $1$ through $12$ and confirming that every number does in fact satisfy one of these conditions, we can conclude that all positive integers satisfy at least one of these conditions. Therefore, our answer is simply $2026$, or $\boxed{\textbf{E}}$.
~Voidling

## Video Solution 1 by SpreadTheMathLove
https://www.youtube.com/watch?v=Jc2s489VKIQ
