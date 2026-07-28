# 2025 AMC 12A Problem 25

> **Adapted Q25 review candidate.** This version asks for ordered pairs of polynomials.

## Problem

Let $P(x)$ and $Q(x)$ be monic polynomials of degree $3$, all of whose roots belong to $\{1,2,3,4,5\}$. Define

$$
f(x)=\frac{P(x)}{Q(x)}.
$$

Suppose that there are real numbers $a<b<c<d$ such that the set of all real numbers $x$ for which $f(x)\leq0$ is the closed interval $[a,b]$ together with the open interval $(c,d)$. How many ordered pairs $(P,Q)$ are possible?

$\textbf{(A)}~7 \qquad \textbf{(B)}~9 \qquad \textbf{(C)}~11 \qquad \textbf{(D)}~12 \qquad \textbf{(E)}~13$

## Solution 1

At the endpoints $a$ and $b$, the function is defined, equal to $0$, and changes sign. Thus $a$ and $b$ are simple roots of $P$, but not roots of $Q$. At the endpoints $c$ and $d$, the function is undefined and changes sign, so they are roots of $Q$. Therefore $a,b,c,d$ are four distinct elements of $\{1,2,3,4,5\}$. Let $t$ be the remaining element.

Because $P$ and $Q$ are monic cubics, we can write

$$
P(x)=(x-a)(x-b)(x-r),\qquad
Q(x)=(x-c)(x-d)(x-s).
$$

The roots at $a$ and $b$ must remain simple and $Q$ must be nonzero there, so $r,s\in\{c,d,t\}$. The factor

$$
\frac{(x-a)(x-b)}{(x-c)(x-d)}
$$

already has exactly the required sign pattern. To preserve a sign change at both $c$ and $d$, the extra factor $(x-r)/(x-s)$ must contribute zero net multiplicity at each of those points. With $r,s\in\{c,d,t\}$, this happens exactly when $r=s$. Write their common value as $u$.

There are two cases.

1. If $u=c$ or $u=d$, the repeated factor changes neither the domain nor the sign pattern at the relevant endpoint. For each of the $5$ choices of the omitted value $t$, there are $2$ choices for $u$, giving $10$ ordered pairs.
2. If $u=t$, the shared factor makes a new hole at $t$. It cannot lie in either nonpositive interval, so $t$ must lie before $a$, between $b$ and $c$, or after $d$. These are the $3$ allowed positions of $t$ among the five ordered values, giving $3$ more ordered pairs.

Thus there are

$$
10+3=13
$$

ordered pairs, so the answer is $\boxed{\textbf{(E)}\ 13}$.
