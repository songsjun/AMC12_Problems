# 2010 AMC 12A Problem 12

> This problem is the same as [2010 AMC 12A #12](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12A_Problems) and [2010 AMC 10A #15](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10A_Problems).
## Problem
In a magical swamp there are two species of talking amphibians: toads, whose statements are always true, and frogs, whose statements are always false. Four amphibians, Brian, Chris, LeRoy, and Mike live together in this swamp, and they make the following statements.

Brian: "Mike and I are different species."

Chris: "LeRoy is a frog."

LeRoy: "Chris is a frog."

Mike: "Of the four of us, at least two are toads."

How many of these amphibians are frogs?

$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$
## Solution 1
Start with Brian. If he is a toad, he tells the truth, hence Mike is a frog. If Brian is a frog, he lies, hence Mike is a frog, too. Thus Mike must be a frog.

As Mike is a frog, his statement is false, hence there is at most one toad.

As there is at most one toad, at least one of Chris and LeRoy is a frog. But then the other one tells the truth, and therefore is a toad.

Hence we must have one toad and $\boxed{\textbf{(D)}\ 3}$ frogs.
## Solution 2 (logical reasoning like solution 1, but a different train of thought)
Notice that one of Chris and LeRoy must be a frog: if Chris is a frog, then he lies about LeRoy being a frog. Hence LeRoy is a toad. Alternatively, if Chris is a toad, then he tells the truth about LeRoy being a frog.

Assume Brian is a toad. Then Mike is a frog, and he lies about at least two being toads. This means that none or one of the amphibians is a toad (the opposite of the statement $n\geq2$ is n<2, or $n=0$, 1). However, this is absurd because we assumed Brian is a toad, and we know one of Chris and LeRoy is a toad. So our assumption leads to a contradiction.

Hence Brian must be a frog, and he and Mike are the same species. Mike is also a frog. One of Chris and LeRoy is a frog. There are 3 frogs in total $\Longrightarrow \boxed{\textbf{(D) } 3}.$

*~JH. L*
## Solution 3: Casework/Proof by contradiction
First, we assume that Brian is a toad. Since his statements are truthful, Mike could not be a toad and must be a frog. Since frogs are liars, Brian must be the only toad in the pond, so Chris and Leroy are both frogs. However, they would then be telling the truth about each other, which only toads do. Hence, this case results in a contraction.
Hence, Brian is a frog. He is lying, so Mike must also be a frog. Mike's statement is also false, so Chris and Leroy cannot both be toads. As shown in the previous case, them both being frogs is impossible, so one must be a toad and the other a frog. Therefore, there must be a total of 3 frogs.
By-Monkey_King
## Video Solution by the Beauty of Math
https://youtu.be/kU70k1-ONgM?t=1207
## See also
