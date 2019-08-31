package eu.cqse;

import com.google.common.base.Preconditions;

import static java.lang.String.join;
import static java.util.stream.Collectors.toSet;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

public class Es6ModuleMasterConverter {

	private static final String INPUT_DIR = "../closure-library-es6";

	public static void main(String[] args) throws IOException {
		ReaderPass readInPass = new ReaderPass();
		readInPass.process(INPUT_DIR);
		validatePass1(readInPass);
		new ConvertingPass().process(readInPass);
	}

	private static void validatePass1(ReaderPass pass1) {
		Preconditions.checkArgument(!pass1.filesByNamespace.keySet().isEmpty(), "No provided namespaces found");
		Preconditions.checkArgument(!pass1.requiresByFile.keys().isEmpty(), "No goog.requires found in input files");

		Collection<GoogRequireOrForwardDeclare> requires = pass1.requiresByFile.values();
		Set<String> allRequires = requires.stream().map(require -> require.requiredNamespace).collect(toSet());

		List<String> unmatchedDependencies = new ArrayList<>();
		allRequires.forEach(requiredNamespace -> {
			if (!pass1.filesByNamespace.containsKey(requiredNamespace)) {
				unmatchedDependencies.add(requiredNamespace);
			}
		});
		if (!unmatchedDependencies.isEmpty()) {
			throw new RuntimeException("Dependencies to found:\n" + join("\n", unmatchedDependencies));
		}
	}
}
